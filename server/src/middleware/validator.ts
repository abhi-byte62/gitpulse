import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// GitHub username: 1-39 alphanumeric or single hyphens, cannot begin/end with hyphen
const usernameSchema = z.string()
  .min(1, 'Username is required')
  .max(39, 'GitHub username cannot exceed 39 characters')
  .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, 'Invalid GitHub username format');

const repoNameSchema = z.string()
  .min(1, 'Repository name is required')
  .max(100, 'Repository name cannot exceed 100 characters')
  .regex(/^[a-zA-Z0-9_.-]+$/, 'Invalid repository name format');

export function validateUsername(req: Request, res: Response, next: NextFunction): void {
  const result = usernameSchema.safeParse(req.params.username);
  if (!result.success) {
    res.status(400).json({
      error: 'Invalid username',
      message: result.error.errors[0]?.message || 'Invalid GitHub username format.',
      statusCode: 400
    });
    return;
  }
  req.params.username = result.data;
  next();
}

export function validateRepoParams(req: Request, res: Response, next: NextFunction): void {
  const ownerResult = usernameSchema.safeParse(req.params.owner);
  const repoResult = repoNameSchema.safeParse(req.params.repo);

  if (!ownerResult.success) {
    res.status(400).json({
      error: 'Invalid owner username',
      message: ownerResult.error.errors[0]?.message || 'Invalid repository owner username format.',
      statusCode: 400
    });
    return;
  }

  if (!repoResult.success) {
    res.status(400).json({
      error: 'Invalid repository name',
      message: repoResult.error.errors[0]?.message || 'Invalid repository name format.',
      statusCode: 400
    });
    return;
  }

  req.params.owner = ownerResult.data;
  req.params.repo = repoResult.data;
  next();
}
