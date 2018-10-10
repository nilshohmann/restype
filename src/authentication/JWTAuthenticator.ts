import * as jwt from 'jsonwebtoken';

import { HttpReqest } from '../core/HttpRequest';
import { Authenticator, getAuthenticationHeader } from './Authenticator';

export class JWTAuthenticator implements Authenticator {

  static createJWT = (payload: any, jwtSecret: string): string => {
    return jwt.sign(payload, jwtSecret);
  }

  constructor(private validator: <User>(token: any) => Promise<User | null>, private jwtSecret: string) {}

  authenticate = async <User>(req: HttpReqest): Promise<User> => {
    const header = getAuthenticationHeader(req);
    if (!header || header.type !== 'bearer') { return null; }

    try {
      const token = jwt.verify(header.value, this.jwtSecret);
      return this.validator<User>(token);
    } catch {
      return null;
    }
  }

}
