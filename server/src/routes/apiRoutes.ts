import { Router } from 'express';
import {
  getDeveloperAnalytics,
  getDeveloperRepositories,
  getRateLimitStatus
} from '../controllers/developerController.js';
import { getRepositoryDetails } from '../controllers/repositoryController.js';
import { validateRepoParams, validateUsername } from '../middleware/validator.js';

export const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'RepoPulse API',
    version: '1.0.0'
  });
});

// GitHub API Rate Limit status
apiRouter.get('/rate-limit', getRateLimitStatus);

// Developer Profile & Analytics endpoints
apiRouter.get('/developers/:username', validateUsername, getDeveloperAnalytics);
apiRouter.get('/developers/:username/repositories', validateUsername, getDeveloperRepositories);

// Repository Details endpoint
apiRouter.get('/repositories/:owner/:repo', validateRepoParams, getRepositoryDetails);
