/*
 * Generic http error.
 */
export class HttpError extends Error {

  public constructor(public status: number, message: string) {
    super(message);
  }

}

export class UnauthorizedError extends HttpError {

  public constructor(message?: string) {
    super(401, message || 'Unauthorized');
  }

}

export class AccessDeniedError extends HttpError {

  public constructor(message?: string) {
    super(401, message || 'Access denied');
  }

}

export class InvalidParamsError extends HttpError {

  public constructor(message?: string) {
    super(400, message || 'Invalid arguements');
  }

}
