import * as jwt from 'jsonwebtoken';

import { HttpReqest } from './HttpRequest';

export interface RestAuthentication {

  basicAuthentication?: <User>(username: string, password: string) => Promise<User>;

  jwtSecret?: string;
  jwtAuthentication?: <User>(token: any) => Promise<User>;

}

export type AuthenticationType = 'basic' | 'jwt';
export const globalAuthentication: RestAuthentication = {};

export class Authenticator {

  public authenticate = async (authenticationType: AuthenticationType, req: HttpReqest): Promise<boolean> => {
    const validator = this.getValidator(authenticationType);
    const authInfoExtractor = authInfoExtractors[authenticationType];
    if (!validator || !authInfoExtractor) {
      throw new Error(`No authentication validator available for '${authenticationType}'`);
    }

    const authInfo = authInfoExtractor(req);
    if (!authInfo) {
      return false;
    }
    return validator(...authInfo);
  }

  private getValidator = (authenticationType: AuthenticationType): ((...args: any[]) => Promise<boolean>) => {
    switch (authenticationType) {
      case 'basic': return globalAuthentication.basicAuthentication;
      case 'jwt': return globalAuthentication.jwtAuthentication;
    }
    return null;
  }

}

function extractHeader(headerField: string, req: HttpReqest): string {
  const header = req.headers[headerField];
  if (typeof header === 'string') {
    return header;
  } else if (header && header.length === 1) {
    return header[0];
  }
  return null;
}

const authInfoExtractors: { [authenticationType: string]: (req: HttpReqest) => any[] } = {
  basic: (req: HttpReqest) => {
    const token = extractHeader('Authorization', req);
    if (!token || !token.match(/^Basic /)) { return null; }

    const credentials = Buffer.from(token.trimRight().replace(/^Basic */, ''), 'base64').toString().split(':');
    if (credentials.length !== 2) {
      return null;
    }
    return credentials;
  },

  jwt: (req: HttpReqest) => {
    const token = extractHeader('x-access-token', req);
    if (!token) { return null; }

    try {
      return [ jwt.verify(token, globalAuthentication.jwtSecret) ];
    } catch {
      return null;
    }
  },
};
