import { Request, Response, NextFunction } from 'express';
import { getCurrentTime } from '../utils/timeUtils';

declare global {
  namespace Express {
    interface Request {
      now: Date;
    }
  }
}

export const timeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Use the existing utility to determine time (checks x-test-now-ms header)
  req.now = getCurrentTime(req);
  next();
};
