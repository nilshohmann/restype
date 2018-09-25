/// <reference types="node" />
import { Request as ExpressRequest } from 'express';
import { Server } from 'http';
import { ContainerInstance } from 'typedi';
import { RestAuthentication } from './authentication/RestAuthentication';
import { HttpConfig } from './HttpConfig';
import { LoggerType } from './Logging';
export interface Request extends ExpressRequest {
    auth: RestAuthentication;
}
export declare class Restype {
    private httpConfig;
    private app;
    private server;
    private container;
    private authentication;
    static useLogger(loggerToUse: LoggerType): void;
    static readonly rootPath: string;
    constructor(httpConfig: HttpConfig, container?: ContainerInstance);
    start: () => Promise<Server>;
    private registerControllers;
    private buildRouter;
    private routeForMethod;
}
