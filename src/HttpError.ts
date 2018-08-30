/*
 * Generic http error.
 */
export class HttpError extends Error {

  public constructor(public status: number, message: string) {
    super(message);
  }

}

export class InvalidParamsError extends HttpError {

  public constructor(message?: string) {
    super(400, message || 'Invalid arguements');
  }

}
