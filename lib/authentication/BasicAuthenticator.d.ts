import { HttpReqest } from '../core/HttpRequest';
import { Authenticator } from './Authenticator';
export declare class BasicAuthenticator implements Authenticator {
    private validator;
    constructor(validator: <User>(username: string, password: string) => Promise<User | null>);
    authenticate: <User>(req: HttpReqest) => Promise<User>;
}
