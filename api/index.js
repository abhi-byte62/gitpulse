// server/src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// server/src/routes/apiRoutes.ts
import { Router } from "express";

// server/src/services/githubService.ts
import { Octokit } from "octokit";

// server/src/analytics/healthScore.ts
function calculateRepositoryHealthScore(repo) {
  let activityScore = 0;
  let documentationScore = 0;
  let stabilityScore = 0;
  let communityScore = 0;
  const positive = [];
  const improvements = [];
  const now = Date.now();
  const pushedAt = repo.pushed_at ? new Date(repo.pushed_at).getTime() : 0;
  const daysSincePush = pushedAt ? Math.max(0, Math.floor((now - pushedAt) / (1e3 * 60 * 60 * 24))) : 999;
  if (daysSincePush <= 14) {
    activityScore = 30;
    positive.push("High freshness: Pushed within the last 14 days");
  } else if (daysSincePush <= 30) {
    activityScore = 25;
    positive.push("Active: Pushed within the last 30 days");
  } else if (daysSincePush <= 90) {
    activityScore = 18;
    positive.push("Maintained: Pushed within the last quarter");
  } else if (daysSincePush <= 180) {
    activityScore = 10;
    improvements.push("Moderate recency: No push in over 3 months");
  } else if (daysSincePush <= 365) {
    activityScore = 5;
    improvements.push("Low activity: No push in over 6 months");
  } else {
    activityScore = 0;
    improvements.push("Stale repository: Inactive for over a year");
  }
  if (repo.description && repo.description.trim().length >= 15) {
    documentationScore += 10;
    positive.push("Comprehensive repository description");
  } else if (repo.description && repo.description.trim().length > 0) {
    documentationScore += 5;
    improvements.push("Short description: consider expanding details");
  } else {
    improvements.push("Missing repository description");
  }
  const hasLicense = Boolean(repo.license);
  if (hasLicense) {
    documentationScore += 8;
    positive.push("Open source license declared");
  } else {
    improvements.push("No license found (consider adding MIT, Apache-2.0, etc.)");
  }
  const topicsCount = repo.topics && Array.isArray(repo.topics) ? repo.topics.length : 0;
  if (topicsCount >= 2) {
    documentationScore += 4;
    positive.push(`Discoverability: Tagged with ${topicsCount} topics`);
  } else if (topicsCount === 1) {
    documentationScore += 2;
  } else {
    improvements.push("No GitHub topics/tags configured");
  }
  if (repo.homepage && repo.homepage.trim().length > 0) {
    documentationScore += 3;
    positive.push("Project website or documentation URL provided");
  }
  if (repo.language) {
    stabilityScore += 8;
    positive.push(`Primary language detected (${repo.language})`);
  } else {
    improvements.push("No primary programming language detected");
  }
  if ((repo.size ?? 0) > 0) {
    stabilityScore += 7;
  } else {
    improvements.push("Repository appears empty (0 KB)");
  }
  if (!repo.archived) {
    stabilityScore += 10;
  } else {
    improvements.push("Repository is archived (read-only)");
  }
  const stars = repo.stargazers_count ?? 0;
  const forks = repo.forks_count ?? 0;
  const watchers = repo.watchers_count ?? 0;
  if (stars >= 100) {
    communityScore += 10;
    positive.push(`Strong community interest (${stars} stars)`);
  } else if (stars >= 20) {
    communityScore += 7;
    positive.push(`Growing community (${stars} stars)`);
  } else if (stars >= 5) {
    communityScore += 4;
  } else if (stars >= 1) {
    communityScore += 2;
  }
  if (forks >= 10) {
    communityScore += 6;
    positive.push(`Active downstream ecosystem (${forks} forks)`);
  } else if (forks >= 1) {
    communityScore += 3;
  }
  if (watchers > 0 || (repo.open_issues_count ?? 0) > 0) {
    communityScore += 4;
  }
  const rawScore = activityScore + documentationScore + stabilityScore + communityScore;
  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));
  let grade = "D";
  if (finalScore >= 90) grade = "A+";
  else if (finalScore >= 80) grade = "A";
  else if (finalScore >= 65) grade = "B";
  else if (finalScore >= 50) grade = "C";
  else grade = "D";
  return {
    score: finalScore,
    grade,
    activityScore,
    documentationScore,
    stabilityScore,
    communityScore,
    factors: {
      positive,
      improvements
    }
  };
}
function calculateDeveloperAggregateHealth(repositories) {
  if (repositories.length === 0) {
    return { score: 0, grade: "D" };
  }
  const nonForkRepos = repositories.filter((r) => !r.isFork);
  const targetRepos = nonForkRepos.length > 0 ? nonForkRepos : repositories;
  const total = targetRepos.reduce((acc, repo) => acc + repo.health.score, 0);
  const score = Math.round(total / targetRepos.length);
  let grade = "D";
  if (score >= 90) grade = "A+";
  else if (score >= 80) grade = "A";
  else if (score >= 65) grade = "B";
  else if (score >= 50) grade = "C";
  else grade = "D";
  return { score, grade };
}

// server/src/utils/languageColors.ts
var GITHUB_LANGUAGE_COLORS = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  "C#": "#178600",
  C: "#555555",
  Go: "#00ADD8",
  Rust: "#dea584",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Shell: "#89e051",
  PowerShell: "#012456",
  Lua: "#000080",
  R: "#198CE7",
  Scala: "#c22d40",
  Elixir: "#6e4a7e",
  Clojure: "#db5855",
  Haskell: "#5e5086",
  Solidity: "#AA6746",
  Zig: "#ec915c",
  Dockerfile: "#384d54",
  Makefile: "#427819",
  GraphQL: "#e10098",
  Markdown: "#083fa1"
};
function getLanguageColor(languageName) {
  if (GITHUB_LANGUAGE_COLORS[languageName]) {
    return GITHUB_LANGUAGE_COLORS[languageName];
  }
  let hash = 0;
  for (let i = 0; i < languageName.length; i++) {
    hash = languageName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 16777215).toString(16).toUpperCase();
  return `#${"00000".substring(0, 6 - c.length)}${c}`;
}

// server/src/analytics/languageAnalytics.ts
function aggregateLanguages(detailedLanguageMaps, fallbackRepos = []) {
  const languageTotals = {};
  if (detailedLanguageMaps.length > 0) {
    for (const langMap of detailedLanguageMaps) {
      for (const [language, bytes] of Object.entries(langMap)) {
        if (typeof bytes === "number" && bytes > 0) {
          languageTotals[language] = (languageTotals[language] || 0) + bytes;
        }
      }
    }
  } else if (fallbackRepos.length > 0) {
    for (const repo of fallbackRepos) {
      if (repo.language) {
        const bytes = Math.max(1024, (repo.size || 1) * 1024);
        languageTotals[repo.language] = (languageTotals[repo.language] || 0) + bytes;
      }
    }
  }
  const totalBytes = Object.values(languageTotals).reduce((sum, b) => sum + b, 0);
  if (totalBytes === 0) {
    return [];
  }
  const sortedLanguages = Object.entries(languageTotals).map(([name, bytes]) => ({
    name,
    bytes,
    percentage: Number((bytes / totalBytes * 100).toFixed(1)),
    color: getLanguageColor(name)
  })).sort((a, b) => b.bytes - a.bytes);
  return sortedLanguages;
}
function normalizeSingleRepoLanguages(languagesMap) {
  const totalBytes = Object.values(languagesMap).reduce((sum, b) => sum + b, 0);
  if (totalBytes === 0) {
    return [];
  }
  return Object.entries(languagesMap).map(([name, bytes]) => ({
    name,
    bytes,
    percentage: Number((bytes / totalBytes * 100).toFixed(1)),
    color: getLanguageColor(name)
  })).sort((a, b) => b.bytes - a.bytes);
}

// server/src/utils/cache.ts
import { LRUCache } from "lru-cache";
var ttlSeconds = parseInt(process.env.CACHE_TTL_SECONDS || "300", 10);
var apiCache = new LRUCache({
  max: 500,
  // store up to 500 cached responses
  ttl: ttlSeconds * 1e3,
  // default 5 minutes
  allowStale: false,
  updateAgeOnGet: false,
  updateAgeOnHas: false
});
function getCached(key) {
  return apiCache.get(key);
}
function setCached(key, value, customTtlMs) {
  apiCache.set(key, value, { ttl: customTtlMs ?? ttlSeconds * 1e3 });
}

// server/src/services/githubService.ts
var GitHubApiError = class extends Error {
  statusCode;
  details;
  resetTime;
  constructor(message, statusCode = 500, details, resetTime) {
    super(message);
    this.name = "GitHubApiError";
    this.statusCode = statusCode;
    this.details = details;
    this.resetTime = resetTime;
  }
};
var GitHubService = class {
  /**
   * Retrieves an Octokit instance with the latest GITHUB_TOKEN and required User-Agent.
   */
  getOctokit() {
    const rawToken = process.env.GITHUB_TOKEN || process.env.GITHUB_API_TOKEN || process.env.GH_TOKEN;
    const token = rawToken ? rawToken.trim() : void 0;
    const userAgent = "RepoPulse-App/1.0.0 (https://github.com/abhi-byte62/gitpulse)";
    if (token && token.length > 0) {
      return new Octokit({
        auth: token,
        userAgent
      });
    }
    return new Octokit({
      userAgent
    });
  }
  /**
   * Fetches current GitHub API Rate Limit status.
   */
  async getRateLimit() {
    try {
      const octokit = this.getOctokit();
      const response = await octokit.rest.rateLimit.get();
      const core = response.data.resources.core;
      return {
        limit: core.limit,
        remaining: core.remaining,
        used: core.used,
        resetAt: new Date(core.reset * 1e3).toISOString()
      };
    } catch (err) {
      console.warn("[RepoPulse RateLimit Check Warning]:", err?.message);
      return {
        limit: 60,
        remaining: 60,
        used: 0,
        resetAt: new Date(Date.now() + 36e5).toISOString()
      };
    }
  }
  /**
   * Fetches and analyzes a full developer profile and repositories.
   */
  async getDeveloperAnalytics(username) {
    const cleanUsername = username.trim().replace(/^@/, "");
    const cacheKey = `developer:${cleanUsername.toLowerCase()}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return cached;
    }
    const octokit = this.getOctokit();
    try {
      const userResponse = await octokit.rest.users.getByUsername({
        username: cleanUsername
      }).catch((err) => {
        if (err.status === 404) {
          throw new GitHubApiError(`GitHub user "${cleanUsername}" not found.`, 404);
        }
        if (err.status === 403 || err.status === 429) {
          const resetHeader = err.response?.headers?.["x-ratelimit-reset"];
          const resetDate = resetHeader ? new Date(parseInt(resetHeader, 10) * 1e3).toISOString() : void 0;
          throw new GitHubApiError("GitHub API rate limit exceeded. Please configure a GITHUB_TOKEN on Vercel.", 429, null, resetDate);
        }
        if (err.status === 401) {
          throw new GitHubApiError("GitHub API authentication failed. Check GITHUB_TOKEN environment variable on Vercel.", 401);
        }
        throw new GitHubApiError(err.message || "Failed to fetch GitHub profile", err.status || 500);
      });
      const rawUser = userResponse.data;
      const reposResponse = await octokit.rest.repos.listForUser({
        username: cleanUsername,
        sort: "updated",
        per_page: 100,
        type: "all"
      }).catch((err) => {
        if (err.status === 403 || err.status === 429) {
          throw new GitHubApiError("GitHub API rate limit reached while fetching repositories.", 429);
        }
        throw new GitHubApiError(err.message || "Failed to fetch repositories", err.status || 500);
      });
      const rawRepos = reposResponse.data;
      let rawEvents = [];
      try {
        const eventsResponse = await octokit.rest.activity.listPublicEventsForUser({
          username: cleanUsername,
          per_page: 30
        });
        rawEvents = eventsResponse.data;
      } catch {
        rawEvents = [];
      }
      const candidateReposForLanguages = rawRepos.filter((r) => !r.fork).sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0)).slice(0, 8);
      const languageMaps = [];
      const languagePromises = candidateReposForLanguages.map(
        (repo) => octokit.rest.repos.listLanguages({
          owner: repo.owner.login,
          repo: repo.name
        }).then((res) => res.data).catch(() => ({}))
      );
      const languageResults = await Promise.all(languagePromises);
      languageMaps.push(...languageResults);
      const languages = aggregateLanguages(
        languageMaps,
        rawRepos.map((r) => ({ language: r.language ?? null, size: r.size }))
      );
      const repositories = rawRepos.map((r) => {
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
          defaultBranch: r.default_branch || "main",
          createdAt: r.created_at || (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: r.updated_at || (/* @__PURE__ */ new Date()).toISOString(),
          pushedAt: r.pushed_at || r.updated_at || (/* @__PURE__ */ new Date()).toISOString(),
          size: r.size || 0,
          license: r.license?.name || null,
          health
        };
      });
      const topRepositories = [...repositories].sort((a, b) => b.stars - a.stars || b.health.score - a.health.score).slice(0, 6);
      const recentlyUpdated = [...repositories].sort((a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime()).slice(0, 6);
      const totalStars = repositories.reduce((sum, r) => sum + r.stars, 0);
      const totalForks = repositories.reduce((sum, r) => sum + r.forks, 0);
      const openIssues = repositories.reduce((sum, r) => sum + r.openIssues, 0);
      const licenseCount = repositories.filter((r) => r.license !== null).length;
      const archivedCount = repositories.filter((r) => r.isArchived).length;
      const stats = {
        repositories: repositories.length,
        totalPublicRepositories: rawUser.public_repos,
        stars: totalStars,
        forks: totalForks,
        openIssues,
        licenseCount,
        archivedCount
      };
      const activity = rawEvents.slice(0, 15).map((e) => {
        let action = "Contributed to";
        let details = "";
        if (e.type === "PushEvent") {
          const commitsCount = e.payload?.commits?.length || 1;
          action = `Pushed ${commitsCount} commit${commitsCount > 1 ? "s" : ""} to`;
          if (e.payload?.commits?.[0]?.message) {
            details = e.payload.commits[0].message.split("\n")[0];
          }
        } else if (e.type === "CreateEvent") {
          action = `Created ${e.payload?.ref_type || "repository"}`;
          details = e.payload?.ref || "";
        } else if (e.type === "WatchEvent") {
          action = "Starred repository";
        } else if (e.type === "ForkEvent") {
          action = "Forked repository";
        } else if (e.type === "IssuesEvent") {
          action = `${e.payload?.action || "Opened"} issue on`;
          details = e.payload?.issue?.title || "";
        } else if (e.type === "PullRequestEvent") {
          action = `${e.payload?.action || "Opened"} pull request on`;
          details = e.payload?.pull_request?.title || "";
        } else if (e.type === "IssueCommentEvent") {
          action = "Commented on issue in";
          details = e.payload?.issue?.title || "";
        }
        return {
          id: e.id,
          type: e.type || "Event",
          repo: e.repo?.name || "",
          createdAt: e.created_at || (/* @__PURE__ */ new Date()).toISOString(),
          action,
          details: details ? details.slice(0, 120) : void 0
        };
      });
      const aggregateHealth = calculateDeveloperAggregateHealth(repositories);
      const mostStarred = [...repositories].sort((a, b) => b.stars - a.stars)[0] || null;
      const mostForked = [...repositories].sort((a, b) => b.forks - a.forks)[0] || null;
      const mostRecentlyUpdated = [...repositories].sort((a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime())[0] || null;
      const now = Date.now();
      const sixMonthsAgo = now - 180 * 24 * 60 * 60 * 1e3;
      const recentlyActiveCount = repositories.filter((r) => new Date(r.pushedAt).getTime() >= sixMonthsAgo).length;
      const maintenanceRate = repositories.length > 0 ? Math.round(recentlyActiveCount / repositories.length * 100) : 0;
      const insights = {
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
      const rateLimitInfo = await this.getRateLimit();
      const profile = {
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
      const normalizedResponse = {
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
      setCached(cacheKey, normalizedResponse);
      return normalizedResponse;
    } catch (error) {
      if (error instanceof GitHubApiError || error?.name === "GitHubApiError") {
        throw error;
      }
      throw new GitHubApiError(error.message || "Internal server error while fetching GitHub analytics", error?.status || 500);
    }
  }
  /**
   * Fetches detailed analytics for a single repository.
   */
  async getRepositoryDetails(owner, repo) {
    const cleanOwner = owner.trim();
    const cleanRepo = repo.trim();
    const cacheKey = `repo:${cleanOwner.toLowerCase()}/${cleanRepo.toLowerCase()}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return cached;
    }
    const octokit = this.getOctokit();
    try {
      const [repoResponse, languagesResponse] = await Promise.all([
        octokit.rest.repos.get({ owner: cleanOwner, repo: cleanRepo }).catch((err) => {
          if (err.status === 404) {
            throw new GitHubApiError(`Repository "${cleanOwner}/${cleanRepo}" was not found.`, 404);
          }
          if (err.status === 403 || err.status === 429) {
            throw new GitHubApiError("GitHub API rate limit exceeded.", 429);
          }
          if (err.status === 401) {
            throw new GitHubApiError("GitHub API authentication failed. Check GITHUB_TOKEN.", 401);
          }
          throw new GitHubApiError(err.message || "Failed to fetch repository", err.status || 500);
        }),
        octokit.rest.repos.listLanguages({ owner: cleanOwner, repo: cleanRepo }).catch(() => ({ data: {} }))
      ]);
      const r = repoResponse.data;
      const languagesMap = languagesResponse.data;
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
      const repository = {
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
        defaultBranch: r.default_branch || "main",
        createdAt: r.created_at || (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: r.updated_at || (/* @__PURE__ */ new Date()).toISOString(),
        pushedAt: r.pushed_at || r.updated_at || (/* @__PURE__ */ new Date()).toISOString(),
        size: r.size || 0,
        license: r.license?.name || null,
        health
      };
      const now = Date.now();
      const lastPushed = r.pushed_at ? new Date(r.pushed_at).getTime() : 0;
      const daysSinceLastPush = lastPushed ? Math.floor((now - lastPushed) / (1e3 * 60 * 60 * 24)) : 999;
      const rateLimitInfo = await this.getRateLimit();
      const detailResponse = {
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
        rateLimitInfo
      };
      setCached(cacheKey, detailResponse);
      return detailResponse;
    } catch (error) {
      if (error instanceof GitHubApiError || error?.name === "GitHubApiError") {
        throw error;
      }
      throw new GitHubApiError(error.message || "Internal server error while fetching repository details", error?.status || 500);
    }
  }
};
var githubService = new GitHubService();

// server/src/controllers/developerController.ts
async function getDeveloperAnalytics(req, res, next) {
  try {
    const username = req.params.username;
    const analytics = await githubService.getDeveloperAnalytics(username);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
}
async function getDeveloperRepositories(req, res, next) {
  try {
    const username = req.params.username;
    const analytics = await githubService.getDeveloperAnalytics(username);
    res.json({
      repositories: analytics.repositories,
      total: analytics.repositories.length
    });
  } catch (error) {
    next(error);
  }
}
async function getRateLimitStatus(_req, res, next) {
  try {
    const rateLimit2 = await githubService.getRateLimit();
    res.json(rateLimit2);
  } catch (error) {
    next(error);
  }
}

// server/src/controllers/repositoryController.ts
async function getRepositoryDetails(req, res, next) {
  try {
    const owner = req.params.owner;
    const repo = req.params.repo;
    const details = await githubService.getRepositoryDetails(owner, repo);
    res.json(details);
  } catch (error) {
    next(error);
  }
}

// server/src/middleware/validator.ts
import { z } from "zod";
var usernameSchema = z.string().min(1, "Username is required").max(39, "GitHub username cannot exceed 39 characters").regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, "Invalid GitHub username format");
var repoNameSchema = z.string().min(1, "Repository name is required").max(100, "Repository name cannot exceed 100 characters").regex(/^[a-zA-Z0-9_.-]+$/, "Invalid repository name format");
function validateUsername(req, res, next) {
  const result = usernameSchema.safeParse(req.params.username);
  if (!result.success) {
    res.status(400).json({
      error: "Invalid username",
      message: result.error.errors[0]?.message || "Invalid GitHub username format.",
      statusCode: 400
    });
    return;
  }
  req.params.username = result.data;
  next();
}
function validateRepoParams(req, res, next) {
  const ownerResult = usernameSchema.safeParse(req.params.owner);
  const repoResult = repoNameSchema.safeParse(req.params.repo);
  if (!ownerResult.success) {
    res.status(400).json({
      error: "Invalid owner username",
      message: ownerResult.error.errors[0]?.message || "Invalid repository owner username format.",
      statusCode: 400
    });
    return;
  }
  if (!repoResult.success) {
    res.status(400).json({
      error: "Invalid repository name",
      message: repoResult.error.errors[0]?.message || "Invalid repository name format.",
      statusCode: 400
    });
    return;
  }
  req.params.owner = ownerResult.data;
  req.params.repo = repoResult.data;
  next();
}

// server/src/routes/apiRoutes.ts
var apiRouter = Router();
apiRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    service: "RepoPulse API",
    version: "1.0.0"
  });
});
apiRouter.get("/rate-limit", getRateLimitStatus);
apiRouter.get("/developers/:username", validateUsername, getDeveloperAnalytics);
apiRouter.get("/developers/:username/repositories", validateUsername, getDeveloperRepositories);
apiRouter.get("/repositories/:owner/:repo", validateRepoParams, getRepositoryDetails);

// server/src/middleware/errorHandler.ts
function errorHandler(err, _req, res, _next) {
  console.error("[RepoPulse Server Error]:", {
    name: err?.name,
    message: err?.message,
    status: err?.status || err?.statusCode,
    stack: process.env.NODE_ENV !== "production" ? err?.stack : void 0
  });
  if (err instanceof GitHubApiError || err?.name === "GitHubApiError") {
    res.status(err.statusCode || 500).json({
      error: err.name || "GitHubApiError",
      message: err.message,
      statusCode: err.statusCode || 500,
      resetTime: err.resetTime
    });
    return;
  }
  const status = typeof err.status === "number" ? err.status : typeof err.statusCode === "number" ? err.statusCode : 500;
  if (status === 404) {
    res.status(404).json({
      error: "NotFound",
      message: err.message || "Resource not found on GitHub.",
      statusCode: 404
    });
    return;
  }
  if (status === 403 || status === 429) {
    const resetHeader = err.response?.headers?.["x-ratelimit-reset"];
    const resetTime = resetHeader ? new Date(parseInt(resetHeader, 10) * 1e3).toISOString() : void 0;
    res.status(429).json({
      error: "RateLimitExceeded",
      message: "GitHub API rate limit reached. Please configure a GITHUB_TOKEN on Vercel or wait for the rate limit to reset.",
      statusCode: 429,
      resetTime
    });
    return;
  }
  if (status === 401) {
    res.status(401).json({
      error: "Unauthorized",
      message: "GitHub API authentication failed. Please check the GITHUB_TOKEN environment variable configured on Vercel.",
      statusCode: 401
    });
    return;
  }
  const message = status === 500 ? err.message && !err.message.includes("node_modules") ? err.message : "An unexpected server error occurred." : err.message || "Error occurred";
  res.status(status).json({
    error: err.name || "InternalServerError",
    message,
    statusCode: status
  });
}

// server/src/app.ts
dotenv.config();
function createApp() {
  const app2 = express();
  app2.set("trust proxy", 1);
  app2.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );
  app2.use(
    cors({
      origin: true,
      credentials: true,
      methods: ["GET", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"]
    })
  );
  app2.use(express.json({ limit: "50kb" }));
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
    message: {
      error: "RateLimitExceeded",
      message: "Too many requests from this IP, please try again later.",
      statusCode: 429
    }
  });
  app2.use(limiter);
  app2.get("/", (_req, res) => {
    res.json({
      status: "ok",
      service: "RepoPulse API",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      routes: [
        "/api/health",
        "/api/rate-limit",
        "/api/developers/:username",
        "/api/repositories/:owner/:repo"
      ]
    });
  });
  app2.use("/api", apiRouter);
  app2.use(apiRouter);
  app2.use((req, res) => {
    res.status(404).json({
      error: "NotFound",
      message: `API endpoint not found: ${req.method} ${req.originalUrl || req.url}`,
      statusCode: 404
    });
  });
  app2.use(errorHandler);
  return app2;
}
var app_default = createApp();

// server/src/serverless.ts
var app = createApp();
function handler(req, res) {
  return app(req, res);
}
export {
  handler as default
};
