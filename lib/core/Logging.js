"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const onFinished = require("on-finished");
class ConsoleLogger {
    log(level, msg, ...meta) {
        console.log.call(this, msg, ...meta);
    }
    debug(msg, ...meta) {
        console.debug.call(this, msg, ...meta);
    }
    verbose(msg, ...meta) {
        console.log.call(this, msg, ...meta);
    }
    info(msg, ...meta) {
        console.info.call(this, msg, ...meta);
    }
    warn(msg, ...meta) {
        console.warn.call(this, msg, ...meta);
    }
    error(msg, error, ...meta) {
        console.error.call(this, msg, error, ...meta);
    }
}
class Logger {
    constructor() {
        this.logger = new ConsoleLogger();
        this.httpLogger = (format, level = 'verbose') => {
            const params = {
                method: (req, res) => req.method,
                url: (req, res) => req.originalUrl,
                body: (req, res) => req.body,
                ip: (req, res) => req.connection.remoteAddress,
                status: (req, res) => String(res.statusCode),
                responseTime: (req, res) => req.__startTime ? String(Date.now() - req.__startTime) : '-',
                contentLength: (req, res) => res.getHeader('content-length') || '-',
                userAgent: (req, res) => req.header('user-agent'),
            };
            const formatMsg = eval('(req, res) => `' +
                format.replace(/{{([^}]+)}}/g, (_, key) => params[key] ? '${params[\'' + key + '\'](req, res)}' : '-') +
                '`');
            return (req, res, next) => {
                req.__startTime = Date.now();
                onFinished(res, () => {
                    const msg = formatMsg(req, res);
                    this.logger.log(level, msg);
                });
                next();
            };
        };
    }
    setLogger(newLogger) {
        this.logger = newLogger;
    }
    log(level, msg, ...meta) {
        this.logger.log(level, msg, ...meta);
    }
    debug(msg, ...meta) {
        this.logger.debug(msg, ...meta);
    }
    verbose(msg, ...meta) {
        this.logger.verbose(msg, ...meta);
    }
    info(msg, ...meta) {
        this.logger.info(msg, ...meta);
    }
    warn(msg, ...meta) {
        this.logger.warn(msg, ...meta);
    }
    error(msg, error, ...meta) {
        this.logger.error(msg, error, ...meta);
    }
}
exports.Logger = Logger;
exports.logger = new Logger();
