/// <reference types="node" />
import { Request as ExpressRequest } from 'express';
import { Server } from 'http';
import { ContainerInstance } from 'typedi';
import { ChallengeAuthentication } from './authentication/ChallengeAuthentication';
import { RestAuthentication } from './authentication/RestAuthentication';
import { HttpConfig } from './HttpConfig';
import { LoggerType } from './Logging';
export interface Request extends ExpressRequest {
    auth: RestAuthentication;
    challenge: ChallengeAuthentication;
}
export declare class Restype {
    private httpConfig;
    private app;
    private server;
    private container;
    private authentication;
    private challengeAuthentication;
    static useLogger(loggerToUse: LoggerType): void;
    static readonly rootPath: string;
    constructor(httpConfig: HttpConfig, container?: ContainerInstance);
    start: () => Promise<Server>;
    private registerControllers;
    private buildRouter;
    private routeForMethod;
}
