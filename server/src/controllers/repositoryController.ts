import { Request, Response, NextFunction } from 'express';
import { githubService } from '../services/githubService.js';

export async function getRepositoryDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const owner = req.params.owner as string;
    const repo = req.params.repo as string;
    const details = await githubService.getRepositoryDetails(owner, repo);
    res.json(details);
  } catch (error) {
    next(error);
  }
}
