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

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

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

  // Global rate limiter to protect backend API with trust-proxy compatibility
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // limit each IP to 300 requests per 15 minutes
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

  // Mount API routes on both '/api' and '/' to guarantee route resolution in both standalone and serverless modes
  app.use('/api', apiRouter);
  app.use(apiRouter);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

export default createApp();
