import {
  ActivityItem,
  DeveloperInsights,
  DeveloperProfile,
  DeveloperStats,
  NormalizedDeveloperResponse,
  RateLimitInfo,
  RepositoryDetailResponse,
  RepositorySummary
} from '../types';
import { calculateDeveloperAggregateHealth, calculateRepositoryHealthScore } from '../analytics/healthScore';
import { aggregateLanguages, normalizeSingleRepoLanguages } from '../analytics/languageAnalytics';

const GITHUB_API_BASE = 'https://api.github.com';

async function fetchGitHub<T>(endpoint: string): Promise<T> {
  const url = `${GITHUB_API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'RepoPulse-App/1.0.0'
    }
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`GitHub resource not found (${res.status}).`);
    }
    if (res.status === 403 || res.status === 429) {
      const reset = res.headers.get('x-ratelimit-reset');
      const resetTime = reset ? new Date(parseInt(reset, 10) * 1000).toLocaleTimeString() : 'soon';
      throw new Error(`GitHub API rate limit reached. Resets at ${resetTime}.`);
    }
    throw new Error(`GitHub API error: ${res.statusText} (${res.status})`);
  }

  return res.json() as Promise<T>;
}

export async function fetchDirectDeveloperAnalytics(username: string): Promise<NormalizedDeveloperResponse> {
  const cleanUser = username.trim().replace(/^@/, '');

  // 1. Fetch user profile
  let rawUser: any;
  try {
    rawUser = await fetchGitHub<any>(`/users/${encodeURIComponent(cleanUser)}`);
  } catch (err: any) {
    if (err.message.includes('404')) {
      throw new Error(`GitHub user "${cleanUser}" not found.`);
    }
    throw err;
  }

  // 2. Fetch repos
  const rawRepos = await fetchGitHub<any[]>(
    `/users/${encodeURIComponent(cleanUser)}/repos?sort=updated&per_page=100&type=all`
  ).catch(() => []);

  // 3. Fetch events
  const rawEvents = await fetchGitHub<any[]>(
    `/users/${encodeURIComponent(cleanUser)}/events/public?per_page=30`
  ).catch(() => []);

  // 4. Fetch detailed languages for top repositories
  const candidateRepos = rawRepos
    .filter((r) => !r.fork)
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 6);

  const languageMaps: Record<string, number>[] = [];
  const languagePromises = candidateRepos.map((repo) =>
    fetchGitHub<Record<string, number>>(`/repos/${repo.owner.login}/${repo.name}/languages`).catch(() => ({}))
  );

  const languageResults = await Promise.all(languagePromises);
  languageMaps.push(...languageResults);

  const languages = aggregateLanguages(
    languageMaps,
    rawRepos.map((r) => ({ language: r.language ?? null, size: r.size }))
  );

  // 5. Transform repositories
  const repositories: RepositorySummary[] = rawRepos.map((r) => {
    const health = calculateRepositoryHealthScore({
      name: r.name,
      description: r.description ?? null,
      homepage: r.homepage ?? null,
      stargazers_count: r.stargazers_count ?? 0,
      forks_count: r.forks_count ?? 0,
      open_issues_count: r.open_issues_count ?? 0,
      watchers_count: r.watchers_count ?? 0,
      language: r.language ?? null,
      topics: r.topics ?? [],
      fork: r.fork ?? false,
      archived: r.archived ?? false,
      pushed_at: r.pushed_at ?? null,
      created_at: r.created_at ?? null,
      size: r.size ?? 0,
      license: r.license?.name ? { name: r.license.name } : null
    });

    return {
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      owner: r.owner.login,
      description: r.description ?? null,
      url: r.html_url,
      homepage: r.homepage || null,
      stars: r.stargazers_count || 0,
      forks: r.forks_count || 0,
      openIssues: r.open_issues_count || 0,
      language: r.language || null,
      topics: r.topics || [],
      isFork: r.fork ?? false,
      isArchived: r.archived ?? false,
      isTemplate: Boolean(r.is_template),
      defaultBranch: r.default_branch || 'main',
      createdAt: r.created_at || new Date().toISOString(),
      updatedAt: r.updated_at || new Date().toISOString(),
      pushedAt: r.pushed_at || r.updated_at || new Date().toISOString(),
      size: r.size || 0,
      license: r.license?.name || null,
      health
    };
  });

  const topRepositories = [...repositories]
    .sort((a, b) => b.stars - a.stars || b.health.score - a.health.score)
    .slice(0, 6);

  const recentlyUpdated = [...repositories]
    .sort((a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime())
    .slice(0, 6);

  const totalStars = repositories.reduce((sum, r) => sum + r.stars, 0);
  const totalForks = repositories.reduce((sum, r) => sum + r.forks, 0);
  const openIssues = repositories.reduce((sum, r) => sum + r.openIssues, 0);
  const licenseCount = repositories.filter((r) => r.license !== null).length;
  const archivedCount = repositories.filter((r) => r.isArchived).length;

  const stats: DeveloperStats = {
    repositories: repositories.length,
    totalPublicRepositories: rawUser.public_repos || repositories.length,
    stars: totalStars,
    forks: totalForks,
    openIssues,
    licenseCount,
    archivedCount
  };

  const activity: ActivityItem[] = rawEvents.slice(0, 15).map((e) => {
    let action = 'Contributed to';
    let details = '';

    if (e.type === 'PushEvent') {
      const commitsCount = e.payload?.commits?.length || 1;
      action = `Pushed ${commitsCount} commit${commitsCount > 1 ? 's' : ''} to`;
      if (e.payload?.commits?.[0]?.message) {
        details = e.payload.commits[0].message.split('\n')[0];
      }
    } else if (e.type === 'CreateEvent') {
      action = `Created ${e.payload?.ref_type || 'repository'}`;
      details = e.payload?.ref || '';
    } else if (e.type === 'WatchEvent') {
      action = 'Starred repository';
    } else if (e.type === 'ForkEvent') {
      action = 'Forked repository';
    } else if (e.type === 'IssuesEvent') {
      action = `${e.payload?.action || 'Opened'} issue on`;
      details = e.payload?.issue?.title || '';
    } else if (e.type === 'PullRequestEvent') {
      action = `${e.payload?.action || 'Opened'} pull request on`;
      details = e.payload?.pull_request?.title || '';
    } else if (e.type === 'IssueCommentEvent') {
      action = 'Commented on issue in';
      details = e.payload?.issue?.title || '';
    }

    return {
      id: e.id,
      type: e.type || 'Event',
      repo: e.repo?.name || '',
      createdAt: e.created_at || new Date().toISOString(),
      action,
      details: details ? details.slice(0, 120) : undefined
    };
  });

  const aggregateHealth = calculateDeveloperAggregateHealth(repositories);
  const mostStarred = [...repositories].sort((a, b) => b.stars - a.stars)[0] || null;
  const mostForked = [...repositories].sort((a, b) => b.forks - a.forks)[0] || null;
  const mostRecentlyUpdated =
    [...repositories].sort((a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime())[0] || null;

  const now = Date.now();
  const sixMonthsAgo = now - 180 * 24 * 60 * 60 * 1000;
  const recentlyActiveCount = repositories.filter((r) => new Date(r.pushedAt).getTime() >= sixMonthsAgo).length;
  const maintenanceRate =
    repositories.length > 0 ? Math.round((recentlyActiveCount / repositories.length) * 100) : 0;

  const insights: DeveloperInsights = {
    healthScore: aggregateHealth.score,
    healthGrade: aggregateHealth.grade,
    mostStarredRepository: mostStarred && mostStarred.stars > 0 ? mostStarred : null,
    mostForkedRepository: mostForked && mostForked.forks > 0 ? mostForked : null,
    mostRecentlyUpdatedRepository: mostRecentlyUpdated,
    primaryLanguage: languages[0]?.name || null,
    activeLanguagesCount: languages.length,
    averageStarsPerRepo: repositories.length > 0 ? Number((totalStars / repositories.length).toFixed(1)) : 0,
    maintenanceRate
  };

  const rateLimitInfo: RateLimitInfo = {
    limit: 60,
    remaining: 60,
    used: 0,
    resetAt: new Date(Date.now() + 3600000).toISOString()
  };

  const profile: DeveloperProfile = {
    username: rawUser.login,
    name: rawUser.name || null,
    avatarUrl: rawUser.avatar_url,
    bio: rawUser.bio || null,
    company: rawUser.company || null,
    location: rawUser.location || null,
    blog: rawUser.blog || null,
    twitterUsername: rawUser.twitter_username || null,
    followers: rawUser.followers,
    following: rawUser.following,
    publicRepositories: rawUser.public_repos,
    publicGists: rawUser.public_gists,
    createdAt: rawUser.created_at,
    profileUrl: rawUser.html_url
  };

  return {
    profile,
    stats,
    languages,
    repositories,
    topRepositories,
    recentlyUpdated,
    activity,
    insights,
    rateLimitInfo
  };
}

export async function fetchDirectRepositoryDetails(owner: string, repo: string): Promise<RepositoryDetailResponse> {
  const [r, languagesMap] = await Promise.all([
    fetchGitHub<any>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`),
    fetchGitHub<Record<string, number>>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`).catch(() => ({}))
  ]);

  const languages = normalizeSingleRepoLanguages(languagesMap);

  const health = calculateRepositoryHealthScore({
    name: r.name,
    description: r.description ?? null,
    homepage: r.homepage ?? null,
    stargazers_count: r.stargazers_count ?? 0,
    forks_count: r.forks_count ?? 0,
    open_issues_count: r.open_issues_count ?? 0,
    watchers_count: r.watchers_count ?? 0,
    language: r.language ?? null,
    topics: r.topics ?? [],
    fork: r.fork ?? false,
    archived: r.archived ?? false,
    pushed_at: r.pushed_at ?? null,
    created_at: r.created_at ?? null,
    size: r.size ?? 0,
    license: r.license?.name ? { name: r.license.name } : null
  });

  const repository: RepositorySummary = {
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    owner: r.owner.login,
    description: r.description ?? null,
    url: r.html_url,
    homepage: r.homepage || null,
    stars: r.stargazers_count || 0,
    forks: r.forks_count || 0,
    openIssues: r.open_issues_count || 0,
    language: r.language || null,
    topics: r.topics || [],
    isFork: r.fork ?? false,
    isArchived: r.archived ?? false,
    isTemplate: Boolean(r.is_template),
    defaultBranch: r.default_branch || 'main',
    createdAt: r.created_at || new Date().toISOString(),
    updatedAt: r.updated_at || new Date().toISOString(),
    pushedAt: r.pushed_at || r.updated_at || new Date().toISOString(),
    size: r.size || 0,
    license: r.license?.name || null,
    health
  };

  const now = Date.now();
  const lastPushed = r.pushed_at ? new Date(r.pushed_at).getTime() : 0;
  const daysSinceLastPush = lastPushed ? Math.floor((now - lastPushed) / (1000 * 60 * 60 * 24)) : 999;

  return {
    repository,
    languages,
    owner: {
      login: r.owner.login,
      avatarUrl: r.owner.avatar_url,
      htmlUrl: r.owner.html_url
    },
    metrics: {
      hasReadme: true,
      hasLicense: Boolean(r.license),
      hasTopics: Boolean(r.topics && r.topics.length > 0),
      hasHomepage: Boolean(r.homepage),
      isFresh: daysSinceLastPush <= 90,
      forkRatio: r.stargazers_count && r.stargazers_count > 0 ? Number(((r.forks_count || 0) / r.stargazers_count).toFixed(2)) : 0,
      daysSinceLastPush
    },
    rateLimitInfo: {
      limit: 60,
      remaining: 60,
      used: 0,
      resetAt: new Date(Date.now() + 3600000).toISOString()
    }
  };
}
