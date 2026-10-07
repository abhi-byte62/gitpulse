import { githubService } from '../services/githubService.js';

export default async function handler(_req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const rateLimit = await githubService.getRateLimit();
    res.statusCode = 200;
    res.end(JSON.stringify(rateLimit));
  } catch (error: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'InternalServerError', message: error.message }));
  }
}
