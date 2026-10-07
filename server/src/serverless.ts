import type { IncomingMessage, ServerResponse } from 'node:http';
import { createApp } from './app.js';

const app = createApp();

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return (app as any)(req, res);
}
