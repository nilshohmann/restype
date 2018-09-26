import { Handler } from 'express';
import { ObjectType } from 'typedi';

import { Credentials } from './authentication/Credentials';

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

  basicAuthentication?: (username: string, password: string) => Promise<any | null>;

  jwtSecret?: string;
  jwtExpirationDuration?: number;
  jwtAuthentication?: (token: any) => Promise<any | null>;

}

export interface ChallengeConfig {

  challengeExpirationDuration?: number;
  credentialsQuery: (username: string) => Promise<Credentials>;

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
  challenge?: ChallengeConfig;
  auth?: AuthConfig;

  logFormat: string;
  logLevel: string;

}
