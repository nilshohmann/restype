import { HttpReqest } from '../core/HttpRequest';
import { Authenticator, getAuthenticationHeader } from './Authenticator';

export class BasicAuthenticator implements Authenticator {

  constructor(private validator: <User>(username: string, password: string) => Promise<User | null>) {}

  authenticate = async <User>(req: HttpReqest): Promise<User> => {
    const header = getAuthenticationHeader(req);
    if (!header || header.type !== 'basic') { return null; }

    const credentials = Buffer.from(header.value, 'base64').toString().split(':');
    if (credentials.length !== 2) {
      return null;
    }

    return this.validator<User>(credentials[0], credentials[1]);
  }

}
