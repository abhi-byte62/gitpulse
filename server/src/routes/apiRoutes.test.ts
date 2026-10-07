import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

describe('API Routes Integration', () => {
  const app = createApp();

  it('GET /api/health returns 200 OK and service status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('RepoPulse API');
  });

  it('GET /api/developers/:username rejects invalid username format', async () => {
    const res = await request(app).get('/api/developers/-invalid--username-');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid username');
  });

  it('GET /api/repositories/:owner/:repo rejects invalid characters in parameters', async () => {
    const res = await request(app).get('/api/repositories/validowner/invalid@repo$name');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid repository name');
  });
});
