import { ExceptionFilter } from "../interfaces/exception-filter";
import { HttpException } from "../exeptions";

export class HttpExceptionFilter implements ExceptionFilter {
  catch(error: any, context: any): void {
    if (error instanceof HttpException) {
      context.res.status(error.status).json({
        statusCode: error.status,
        message: error.message,
        timestamp: new Date().toISOString(),
        path: context.req.url,
      });
    } else {
      // Handle unexpected errors
      context.res.status(500).json({
        statusCode: 500,
        message: "Internal server error",
        timestamp: new Date().toISOString(),
        path: context.req.url,
      });
    }
  }
}
