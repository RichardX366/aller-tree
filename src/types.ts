export interface UserAuthHeader {
  email: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserAuthHeader;
  }
}
