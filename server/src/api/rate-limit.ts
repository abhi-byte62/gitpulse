import { githubService } from '../services/githubService.js';

export default async function handler(_req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const rateLimit = await githubService.getRateLimit();
    if (typeof res.status === 'function') {
      return res.status(200).json(rateLimit);
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(rateLimit));
  } catch (error: any) {
    if (typeof res.status === 'function') {
      return res.status(500).json({ error: 'InternalServerError', message: error.message });
    }
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'InternalServerError', message: error.message }));
  }
}
