import { githubService } from '../../../server/src/services/githubService.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  let owner = req.query?.owner;
  let repo = req.query?.repo;

  if (!owner || !repo) {
    const parts = req.url?.split('?')[0]?.split('/').filter(Boolean);
    if (parts && parts.length >= 3) {
      owner = parts[parts.length - 2];
      repo = parts[parts.length - 1];
    }
  }

  if (!owner || !repo) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'BadRequest', message: 'Both repository owner and name are required.' }));
    return;
  }

  try {
    const details = await githubService.getRepositoryDetails(owner, repo);
    res.statusCode = 200;
    res.end(JSON.stringify(details));
  } catch (error: any) {
    const status = error.statusCode || error.status || 500;
    res.statusCode = status;
    res.end(
      JSON.stringify({
        error: error.name || (status === 404 ? 'NotFound' : 'InternalServerError'),
        message: error.message || 'Error occurred while fetching repository details.',
        statusCode: status,
        resetTime: error.resetTime
      })
    );
  }
}
