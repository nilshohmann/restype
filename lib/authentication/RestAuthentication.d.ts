import { AuthConfig } from '../HttpConfig';
import { HttpReqest } from '../HttpRequest';
export declare type AuthenticationType = 'basic' | 'jwt';
export declare class RestAuthentication {
    private config;
    private readonly authenticators;
    constructor(config: AuthConfig);
    authenticate: <User>(authenticationType: AuthenticationType, req: HttpReqest) => Promise<User>;
    createJWT: (payload: any) => string;
}
