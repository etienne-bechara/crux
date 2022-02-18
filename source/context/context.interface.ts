export interface ContextJwtPayload extends Record<string, any> {
  iss: string;
  sub: string;
  aud: string;
  iat: number;
  exp: number;
  at_hash: string;
  nonce: string;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
}
