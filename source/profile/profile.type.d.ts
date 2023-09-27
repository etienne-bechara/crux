/**
 * @pyroscope/nodejs references "express" npm package but
 * we are not interested in installing it just for types
 * since our framework uses "fastify".
 * 
 * This module mocks internally referenced types in order
 * to be able to build application without dependency.
 */
declare module 'express' {
  export interface Request { }
  export interface Response { }
  export interface NextFunction { }
}
