import {Injectable, Logger, NestMiddleware} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {

  constructor(
    private readonly logger: Logger
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on('finish', () =>
      this.logger.log(`${req.method} ${req.originalUrl} – ${Date.now() - start}ms`)
    );
    next();
  }
}