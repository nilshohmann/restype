import { NextFunction, Request, Response } from 'express';
import * as onFinished from 'on-finished';

export interface LoggerType {

  log(level: string, msg: string, ...meta: any[]): any;
  debug(msg: string, ...meta: any[]): any;
  verbose(msg: string, ...meta: any[]): any;
  info(msg: string, ...meta: any[]): any;
  warn(msg: string, ...meta: any[]): any;
  error(msg: string, error: Error, ...meta: any[]): any;

}

class ConsoleLogger implements LoggerType {

  public log(level: string, msg: string, ...meta: any[]): any {
    console.log.call(this, msg, ...meta);
  }

  public debug(msg: string, ...meta: any[]): any {
    console.debug.call(this, msg, ...meta);
  }

  public verbose(msg: string, ...meta: any[]): any {
    console.log.call(this, msg, ...meta);
  }

  public info(msg: string, ...meta: any[]): any {
    console.info.call(this, msg, ...meta);
  }

  public warn(msg: string, ...meta: any[]): any {
    console.warn.call(this, msg, ...meta);
  }
  public error(msg: string, error: Error, ...meta: any[]): any {
    console.error.call(this, msg, error, ...meta);
  }

}

export class Logger implements LoggerType {

  private logger: LoggerType = new ConsoleLogger();

  public setLogger(newLogger: LoggerType) {
    this.logger = newLogger;
  }

  public log(level: string, msg: string, ...meta: any[]): any {
    this.logger.log(level, msg, ...meta);
  }

  public debug(msg: string, ...meta: any[]): any {
    this.logger.debug(msg, ...meta);
  }

  public verbose(msg: string, ...meta: any[]): any {
    this.logger.verbose(msg, ...meta);
  }

  public info(msg: string, ...meta: any[]): any {
    this.logger.info(msg, ...meta);
  }

  public warn(msg: string, ...meta: any[]): any {
    this.logger.warn(msg, ...meta);
  }

  public error(msg: string, error: Error, ...meta: any[]): any {
    this.logger.error(msg, error, ...meta);
  }

  public httpLogger = (format: string, level: string = 'verbose') => {
    const params: { [key: string]: (req: Request, res: Response) => string } = {
      method: (req, res) => req.method,
      url: (req, res) => req.originalUrl,
      body: (req, res) => req.body as string,
      ip: (req, res) => req.connection.remoteAddress,
      status: (req, res) => String(res.statusCode),
      responseTime: (req, res) => (req as any).__startTime ? String(Date.now() - (req as any).__startTime) : '-',
      contentLength: (req, res) => res.getHeader('content-length') as string || '-',
      userAgent: (req, res) => req.header('user-agent'),
    };

    const formatMsg = eval('(req, res) => `' +
      format.replace(/{{([^}]+)}}/g, (_, key) => params[key] ? '${params[\'' + key + '\'](req, res)}' : '-') +
      '`');

    return (req: Request, res: Response, next: NextFunction) => {
      (req as any).__startTime = Date.now();

      onFinished(res, () => {
        const msg = formatMsg(req, res);
        this.logger.log(level, msg);
      });

      next();
    };
  }

}

export const logger = new Logger();
