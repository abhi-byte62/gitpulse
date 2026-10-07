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

  // Trust proxy for Vercel / reverse-proxy environments so express-rate-limit and IP detection work correctly
  app.set('trust proxy', 1);

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS configuration: Support local development, Vercel deployments, and custom domains
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        const allowed = process.env.CLIENT_URL;
        if (
          !allowed ||
          origin === allowed ||
          origin.endsWith('.vercel.app') ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1')
        ) {
          return callback(null, true);
        }

        // Allow all in non-strict mode for public API consumption
        return callback(null, true);
      },
      methods: ['GET', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Parse JSON payloads with reasonable size limit
  app.use(express.json({ limit: '50kb' }));

  // Global rate limiter to protect backend API with trust-proxy compatibility
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false }, // Prevent crash in proxy environments
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
