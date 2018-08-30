/// <reference types="node" />
import { Server } from 'http';
import { ContainerInstance } from 'typedi';
import { HttpConfig } from './HttpConfig';
import { LoggerType } from './Logging';
export declare class Restype {
    private httpConfig;
    private app;
    private server;
    private container;
    static useLogger(loggerToUse: LoggerType): void;
    static readonly rootPath: string;
    constructor(httpConfig: HttpConfig, container?: ContainerInstance);
    start: () => Promise<Server>;
    private registerControllers;
    private buildRouter;
    private routeForMethod;
}