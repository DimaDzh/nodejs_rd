import { IncomingMessage, ServerResponse } from "http";
import { HttpException } from "../exeptions";

export function errorHandler(
  err: any,
  req: IncomingMessage,
  res: ServerResponse
) {
  if (err instanceof HttpException) {
    res.writeHead(err.status, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        statusCode: err.status,
        message: err.response,
      })
    );
  } else {
    // Невідомі помилки → 500
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        statusCode: 500,
        message: "Internal Server Error",
        error: err?.message || String(err),
      })
    );
  }
}
