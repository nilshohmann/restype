"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const http_1 = require("http");
const path = require("path");
const typedi_1 = require("typedi");
const RestAuthentication_1 = require("../authentication/RestAuthentication");
const Logging_1 = require("./Logging");
const Register_1 = require("./Register");
const RouterBuilder_1 = require("./RouterBuilder");
class Restype {
    constructor(config, container, app) {
        this.config = config;
        this.container = container;
        this.app = app;
        this.prepareAccessControl = () => {
            const config = this.config.accessControl;
            const allowOrigin = config.allowOrigin || '';
            const allowHeaders = Array.isArray(config.allowHeaders) ? config.allowHeaders.join(',') : config.allowHeaders || '*';
            const allowMethods = Array.isArray(config.allowMethods) ? config.allowMethods.join(',') : config.allowMethods || '*';
            this.app.use((req, res, next) => {
                res.header('Access-Control-Allow-Origin', allowOrigin);
                res.header('Access-Control-Allow-Headers', allowHeaders);
                res.header('Access-Control-Allow-Methods', allowMethods);
                next();
            });
        };
        this.start = () => {
            return new Promise((resolve, reject) => {
                this.server = http_1.createServer(this.app);
                this.server.on('listening', () => {
                    resolve(this.server);
                });
                this.server.on('error', (error) => {
                    if (error.syscall !== 'listen') {
                        Logging_1.logger.error('Server error:', error.stack);
                        return;
                    }
                    switch (error.code) {
                        case 'EACCES':
                            reject(new Error(`Port ${this.config.port} requires elevated privileges.`));
                            break;
                        case 'EADDRINUSE':
                            reject(new Error(`Port ${this.config.port} is already in use.`));
                            break;
                        default:
                            reject(error);
                    }
                });
                this.server.listen(this.config.port, this.config.host);
            });
        };
        this.registerControllers = () => {
            const routerBuilder = new RouterBuilder_1.RouterBuilder(this.container, this.authentication);
            this.config.controllers.forEach((controller) => {
                const controllerInfo = Register_1.controllerFor(controller);
                if (!controllerInfo) {
                    Logging_1.logger.warn('Controller not registered:', controller.prototype.constructor.name);
                    return;
                }
                const routes = Register_1.routesFor(controllerInfo.controller);
                if (!routes || !routes.length) {
                    Logging_1.logger.warn('No routes for controller', controller.prototype.constructor.name);
                    return;
                }
                Logging_1.logger.verbose('Registering controller:', controllerInfo.controller.prototype.constructor.name);
                this.app.use(this.config.apiPath, routerBuilder.build(controllerInfo, routes));
            });
        };
        this.config = this.prepareConfig(config);
        this.app = this.app || express();
        this.app.use(Logging_1.logger.httpLogger(this.config.logFormat, this.config.logLevel))
            .use(bodyParser.json({ limit: this.config.fileSizeLimit }))
            .use(bodyParser.urlencoded({ extended: true, limit: this.config.fileSizeLimit }))
            .use(cookieParser())
            .enable('strict routing');
        this.prepareAccessControl();
        this.authentication = new RestAuthentication_1.RestAuthentication(this.config.auth);
        this.container = this.container || typedi_1.Container.of(undefined);
        if (this.container) {
            Register_1.registerForContainer(this.container);
        }
        this.registerControllers();
        this.app.use(this.config.apiPath, (req, res) => {
            res.status(403).send({ error: 'Forbidden' });
        });
        const publicPath = path.join(Restype.rootPath, this.config.publicPath);
        Logging_1.logger.info('Public path:', publicPath);
        this.app.use(express.static(publicPath, { dotfiles: 'ignore', etag: true, immutable: true, maxAge: '1h' }));
        this.config.customRoutes.forEach((routeInfo) => {
            this.app.use(routeInfo.route, routeInfo.handler);
        });
        this.app.get('*', (req, res) => {
            res.status(404).send({ error: 'Not found' });
        });
    }
    static useLogger(loggerToUse) {
        Logging_1.logger.setLogger(loggerToUse);
    }
    static get rootPath() {
        return path.dirname(process.argv[1]);
    }
    prepareConfig(config) {
        config.host = config.host || 'localhost';
        config.port = config.port || 80;
        config.apiPath = config.apiPath || '/api';
        config.publicPath = config.publicPath || '/public';
        config.controllers = config.controllers || [];
        config.customRoutes = config.customRoutes || [];
        config.fileSizeLimit = config.fileSizeLimit || '5mb';
        config.accessControl = config.accessControl || {};
        config.auth = config.auth || {};
        config.logFormat = config.logFormat || '{{method}} {{url}} -> {{status}}, {{responseTime}} ms, {{contentLength}} byte';
        config.logLevel = config.logLevel || 'warn';
        return config;
    }
}
exports.Restype = Restype;
