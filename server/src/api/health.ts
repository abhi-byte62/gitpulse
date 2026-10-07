import type { IncomingMessage, ServerResponse } from 'node:http';

export default async function handler(_req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const data = {
    status: 'ok',
    service: 'RepoPulse API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };

  if (typeof res.status === 'function') {
    return res.status(200).json(data);
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(data));
}
