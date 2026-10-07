import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { apiRouter } from './routes/apiRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

export function createApp(): Express {
  const app = express();

  // Trust proxy for Vercel and reverse-proxy environments
  app.set('trust proxy', 1);

  // Disable X-Powered-By header safely
  app.disable('x-powered-by');

  // Standard safe security headers (compatible with Vercel serverless response)
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // CORS configuration
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Parse JSON payloads with reasonable size limit
  app.use(express.json({ limit: '50kb' }));

  // Global rate limiter with trust-proxy compatibility
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
    message: {
      error: 'RateLimitExceeded',
      message: 'Too many requests from this IP, please try again later.',
      statusCode: 429
    }
  });
  app.use(limiter);

  // Root & /api diagnostics endpoint (for testing root-level serverless invocation)
  const rootHandler = (_req: express.Request, res: express.Response) => {
    res.json({
      status: 'ok',
      service: 'RepoPulse API',
      timestamp: new Date().toISOString(),
      routes: [
        '/api/health',
        '/api/rate-limit',
        '/api/developers/:username',
        '/api/repositories/:owner/:repo'
      ]
    });
  };
  app.get('/', rootHandler);
  app.get('/api', rootHandler);

  // Mount API routes on both '/api' and '/' to guarantee route resolution in both standalone and serverless modes
  app.use('/api', apiRouter);
  app.use(apiRouter);

  // 404 handler for unmatched API routes
  app.use((req, res) => {
    res.status(404).json({
      error: 'NotFound',
      message: `API endpoint not found: ${req.method} ${req.originalUrl || req.url}`,
      statusCode: 404
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

export default createApp();
