import type { IncomingMessage, ServerResponse } from 'node:http';

export default async function handler(_req: IncomingMessage, res: any) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(
    JSON.stringify({
      status: 'ok',
      service: 'RepoPulse API',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    })
  );
}
