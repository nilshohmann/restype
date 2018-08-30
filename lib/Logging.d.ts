import { NextFunction, Request, Response } from 'express';
export interface LoggerType {
    log(level: string, msg: string, ...meta: any[]): any;
    debug(msg: string, ...meta: any[]): any;
    verbose(msg: string, ...meta: any[]): any;
    info(msg: string, ...meta: any[]): any;
    warn(msg: string, ...meta: any[]): any;
    error(msg: string, error: Error, ...meta: any[]): any;
}
export declare class Logger implements LoggerType {
    private logger;
    setLogger(newLogger: LoggerType): void;
    log(level: string, msg: string, ...meta: any[]): any;
    debug(msg: string, ...meta: any[]): any;
    verbose(msg: string, ...meta: any[]): any;
    info(msg: string, ...meta: any[]): any;
    warn(msg: string, ...meta: any[]): any;
    error(msg: string, error: Error, ...meta: any[]): any;
    httpLogger: (format: string, level?: string) => (req: Request, res: Response, next: NextFunction) => void;
}
export declare const logger: Logger;
