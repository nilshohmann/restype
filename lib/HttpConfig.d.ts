import { Handler } from 'express';
import { ObjectType } from 'typedi';
export interface CustomRouteInfo {
    route: string;
    handler: Handler;
}
export interface AccessControlConfig {
    allowOrigin?: string;
    allowHeaders?: string[];
    allowMethods?: string[];
}
export interface AuthConfig {
    basicAuthentication?: <User>(username: string, password: string) => Promise<User | null>;
    jwtSecret?: string;
    jwtExpirationDuration?: number;
    jwtAuthentication?: <User>(token: any) => Promise<User | null>;
}
export interface HttpConfig {
    host?: string;
    port: number;
    apiPath: string;
    publicPath: string;
    controllers?: Array<ObjectType<any>>;
    customRoutes?: CustomRouteInfo[];
    fileSizeLimit?: string;
    accessControl?: AccessControlConfig;
    auth?: AuthConfig;
    logFormat: string;
    logLevel: string;
}
