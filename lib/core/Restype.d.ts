/// <reference types="node" />
import { Express } from 'express';
import { Server } from 'http';
import { ContainerInstance } from 'typedi';
import { HttpConfig } from './HttpConfig';
import { LoggerType } from './Logging';
export declare class Restype {
    private config;
    private container?;
    private app?;
    private server;
    private authentication;
    static useLogger(loggerToUse: LoggerType): void;
    static readonly rootPath: string;
    constructor(config: HttpConfig, container?: ContainerInstance, app?: Express);
    private prepareConfig;
    private prepareAccessControl;
    start: () => Promise<Server>;
    private registerControllers;
}
