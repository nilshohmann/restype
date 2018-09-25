import { AuthConfig } from '../HttpConfig';
import { HttpReqest } from '../HttpRequest';
import { logger } from '../Logging';

import { Authenticator } from './Authenticator';
import { BasicAuthenticator } from './BasicAuthenticator';
import { JWTAuthenticator } from './JWTAuthenticator';

export type AuthenticationType = 'basic' | 'jwt';

export class RestAuthentication {

  private config: AuthConfig;
  private readonly authenticators: { [type: string]: Authenticator } = { };

  constructor(config: AuthConfig) {
    this.config = config || {};

    if (typeof(this.config.basicAuthentication) === 'function') {
      this.authenticators['basic'] = new BasicAuthenticator(this.config.basicAuthentication);
    }

    if (typeof(this.config.jwtAuthentication) === 'function') {
      this.authenticators['jwt'] = new JWTAuthenticator(this.config.jwtAuthentication, this.config.jwtSecret);
    }
  }

  public authenticate = async <User>(authenticationType: AuthenticationType, req: HttpReqest): Promise<User> => {
    const authenticator = this.authenticators[authenticationType];
    if (!authenticator) {
      logger.warn(`No authentication for type '${authenticationType}' found.`);
      return null;
    }

    return authenticator.authenticate<User>(req);
  }

  public createJWT = (payload: any): string => {
    return JWTAuthenticator.createJWT(payload, this.config.jwtSecret);
  }

}
