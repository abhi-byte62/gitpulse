import { Request, Response, NextFunction } from 'express';
import { githubService } from '../services/githubService.js';

export async function getDeveloperAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const username = req.params.username as string;
    const analytics = await githubService.getDeveloperAnalytics(username);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
}

export async function getDeveloperRepositories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const username = req.params.username as string;
    const analytics = await githubService.getDeveloperAnalytics(username);
    res.json({
      repositories: analytics.repositories,
      total: analytics.repositories.length
    });
  } catch (error) {
    next(error);
  }
}

export async function getRateLimitStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rateLimit = await githubService.getRateLimit();
    res.json(rateLimit);
  } catch (error) {
    next(error);
  }
}
