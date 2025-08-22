import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class CustomLoggerService implements LoggerService {
  log(message: string, context?: string | object): void {
    const timestamp = new Date().toISOString();
    if (typeof context === 'object') {
      console.log(`[${timestamp}] ${message}`, context);
    } else {
      console.log(`[${timestamp}] ${context ? `[${context}] ` : ''}${message}`);
    }
  }

  error(message: string, trace?: string, context?: string): void {
    const timestamp = new Date().toISOString();
    console.error(
      `[${timestamp}] ERROR ${context ? `[${context}] ` : ''}${message}`,
    );
    if (trace) {
      console.error(trace);
    }
  }

  warn(message: string, context?: string): void {
    const timestamp = new Date().toISOString();
    console.warn(
      `[${timestamp}] WARN ${context ? `[${context}] ` : ''}${message}`,
    );
  }

  debug(message: string, context?: string): void {
    const timestamp = new Date().toISOString();
    console.debug(
      `[${timestamp}] DEBUG ${context ? `[${context}] ` : ''}${message}`,
    );
  }

  verbose(message: string, context?: string): void {
    const timestamp = new Date().toISOString();
    console.log(
      `[${timestamp}] VERBOSE ${context ? `[${context}] ` : ''}${message}`,
    );
  }
}
