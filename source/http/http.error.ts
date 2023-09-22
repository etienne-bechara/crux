export class HttpError extends Error {

  public constructor(
    public readonly message: string,
    public readonly response: Response,
  ) {
    super();
  }

}
