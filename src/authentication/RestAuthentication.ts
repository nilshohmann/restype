import { AuthConfig } from '../core/HttpConfig';
import { HttpReqest } from '../core/HttpRequest';
import { logger } from '../core/Logging';

import { Authenticator } from './Authenticator';
import { BasicAuthenticator } from './BasicAuthenticator';
import { ChallengeAuthentication } from './ChallengeAuthentication';
import { JWTAuthenticator } from './JWTAuthenticator';

export type AuthenticationType = 'basic' | 'jwt';

export class RestAuthentication {

  public readonly challenge: ChallengeAuthentication;

  private config: AuthConfig;
  private readonly authenticators: { [type: string]: Authenticator } = { };

  constructor(config: AuthConfig) {
    this.config = config || {};
    this.challenge = new ChallengeAuthentication(config);

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

  public createJWT = <Payload>(payload: Payload): string => {
    return JWTAuthenticator.createJWT(payload, this.config.jwtSecret);
  }

}
