import { Request } from 'express';
export const getCurrentTime = (req: Request): Date => {
  const testMode = process.env.TEST_MODE === '1';
  if (testMode) {
    const headerTime = req.headers['x-test-now-ms'];
    if (headerTime && typeof headerTime === 'string') {
      const ms = parseInt(headerTime, 10);
      if (!isNaN(ms)) {
        return new Date(ms);
      }
    }
  }
  return new Date();
};
