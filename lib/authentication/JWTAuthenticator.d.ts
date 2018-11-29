import { HttpReqest } from '../core/HttpRequest';
import { Authenticator } from './Authenticator';
export declare class JWTAuthenticator implements Authenticator {
    private validator;
    private jwtSecret;
    static createJWT: (payload: any, jwtSecret: string) => string;
    constructor(validator: <User>(token: any) => Promise<User | null>, jwtSecret: string);
    authenticate: <User>(req: HttpReqest) => Promise<User>;
    private _authenticate;
}
