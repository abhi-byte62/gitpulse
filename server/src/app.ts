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

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS configuration
  const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
  app.use(
    cors({
      origin: process.env.NODE_ENV === 'production' ? allowedOrigin : '*',
      methods: ['GET', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Parse JSON payloads with reasonable size limit
  app.use(express.json({ limit: '50kb' }));

  // Global rate limiter to protect backend API
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 120, // limit each IP to 120 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'RateLimitExceeded',
      message: 'Too many requests from this IP, please try again later.',
      statusCode: 429
    }
  });
  app.use('/api', limiter);

  // Mount API routes
  app.use('/api', apiRouter);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
