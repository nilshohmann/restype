import { AuthConfig } from '../core/HttpConfig';
import { HttpReqest } from '../core/HttpRequest';
import { ChallengeAuthentication } from './ChallengeAuthentication';
export declare type AuthenticationType = 'basic' | 'jwt';
export declare class RestAuthentication {
    readonly challenge: ChallengeAuthentication;
    private config;
    private readonly authenticators;
    constructor(config: AuthConfig);
    authenticate: <User>(authenticationType: AuthenticationType, req: HttpReqest) => Promise<User>;
    createJWT: <Payload>(payload: Payload) => string;
}
