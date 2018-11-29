import * as jwt from 'jsonwebtoken';

import { HttpReqest } from '../core/HttpRequest';
import { Authenticator, getAuthenticationHeader } from './Authenticator';

export class JWTAuthenticator implements Authenticator {
  static createJWT = (payload: any, jwtSecret: string): string => {
    return jwt.sign(payload, jwtSecret);
  };

  constructor(private validator: <User>(token: any) => Promise<User | null>, private jwtSecret: string) {}

  authenticate = async <User>(req: HttpReqest): Promise<User | null> => {
    const header = getAuthenticationHeader(req);
    if (header && header.type === 'bearer') {
      return this._authenticate<User>(header.value);
    }

    const tokenHeader = req.cookies && req.cookies['access_token'];
    if (tokenHeader) {
      return this._authenticate<User>(tokenHeader);
    }

    return null;
  };

  private _authenticate = <User>(token: string): Promise<User | null> => {
    try {
      const rawToken = jwt.verify(token, this.jwtSecret);
      return this.validator<User>(rawToken);
    } catch {
      return null;
    }
  };
}
