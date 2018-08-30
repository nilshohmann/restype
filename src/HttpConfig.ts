import { Handler } from 'express';
import { ObjectType } from 'typedi';

export interface CustomRouteInfo {
  route: string;
  handler: Handler;
}

export interface HttpConfig {

  host?: string;
  port: number;
  apiPath: string;
  publicPath: string;
  logFormat: string;
  logLevel: string;
  controllers?: Array<ObjectType<any>>;
  customRoutes?: CustomRouteInfo[];

}
