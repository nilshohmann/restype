import { Handler } from 'express';
import { ObjectType } from 'typedi';
export interface CustomRouteInfo {
    route: string;
    handler: Handler;
}
export interface AccessControlConfig {
    allowOrigin?: string;
    allowHeaders?: string | string[];
    allowMethods?: string | string[];
}
export interface AuthConfig {
    basicAuthentication?: (username: string, password: string) => Promise<any | null>;
    jwtSecret?: string;
    jwtExpirationDuration?: number;
    jwtAuthentication?: (token: any) => Promise<any | null>;
    challengeExpirationDuration?: number;
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
    logFormat?: string;
    logLevel: string;
}
