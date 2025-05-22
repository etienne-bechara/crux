export class HttpFetchError extends Error {
	public constructor(
		public readonly message: string,
		public readonly response: Response,
	) {
		super();
	}
}
