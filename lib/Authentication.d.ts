import { HttpReqest } from './HttpRequest';
export interface RestAuthentication {
    basicAuthentication?: <User>(username: string, password: string) => Promise<User>;
    jwtSecret?: string;
    jwtAuthentication?: <User>(token: any) => Promise<User>;
}
export declare type AuthenticationType = 'basic' | 'jwt';
export declare const globalAuthentication: RestAuthentication;
export declare class Authenticator {
    authenticate: (authenticationType: AuthenticationType, req: HttpReqest) => Promise<boolean>;
    private getValidator;
}
