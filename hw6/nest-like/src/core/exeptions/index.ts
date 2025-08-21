export class HttpException extends Error {
  public readonly status: number;
  public readonly response: any;

  constructor(status: number, message: string | object) {
    super(typeof message === "string" ? message : JSON.stringify(message));
    this.status = status;
    this.response = message;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string = "Bad Request") {
    super(400, message);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = "Unauthorized") {
    super(401, message);
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string = "Not Found") {
    super(404, message);
  }
}
