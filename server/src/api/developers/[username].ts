import { githubService } from '../../services/githubService.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const username = req.query?.username || req.url?.split('?')[0]?.split('/').pop();
  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'BadRequest', message: 'GitHub username is required.' }));
    return;
  }

  try {
    const analytics = await githubService.getDeveloperAnalytics(username);
    res.statusCode = 200;
    res.end(JSON.stringify(analytics));
  } catch (error: any) {
    const status = error.statusCode || error.status || 500;
    res.statusCode = status;
    res.end(
      JSON.stringify({
        error: error.name || (status === 404 ? 'NotFound' : 'InternalServerError'),
        message: error.message || 'Error occurred while analyzing GitHub developer profile.',
        statusCode: status,
        resetTime: error.resetTime
      })
    );
  }
}
