"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const express_1 = require("express");
const http_1 = require("http");
const path = require("path");
const typedi_1 = require("typedi");
const ChallengeAuthentication_1 = require("./authentication/ChallengeAuthentication");
const RestAuthentication_1 = require("./authentication/RestAuthentication");
const HttpError_1 = require("./HttpError");
const Logging_1 = require("./Logging");
const Register_1 = require("./Register");
class Restype {
    constructor(httpConfig, container) {
        this.httpConfig = httpConfig;
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
                            reject(new Error(`Port ${this.httpConfig.port} requires elevated privileges.`));
                            break;
                        case 'EADDRINUSE':
                            reject(new Error(`Port ${this.httpConfig.port} is already in use.`));
                            break;
                        default:
                            reject(error);
                    }
                });
                this.server.listen(this.httpConfig.port, this.httpConfig.host);
            });
        };
        this.registerControllers = () => {
            this.httpConfig.controllers.forEach((controller) => {
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
                this.app.use(this.httpConfig.apiPath, this.buildRouter(controllerInfo, routes));
            });
        };
        this.buildRouter = (controllerItem, routes) => {
            const router = express_1.Router();
            routes.forEach((routeItem) => {
                const routeFunc = this.routeForMethod(controllerItem, routeItem);
                const route = controllerItem.options.route + routeItem.options.route;
                switch (routeItem.options.method) {
                    case 'GET':
                        router.get(route, routeFunc);
                        break;
                    case 'HEAD':
                        router.head(route, routeFunc);
                        break;
                    case 'POST':
                        router.post(route, routeFunc);
                        break;
                    case 'PUT':
                        router.put(route, routeFunc);
                        break;
                    case 'PATCH':
                        router.patch(route, routeFunc);
                        break;
                    case 'DELETE':
                        router.delete(route, routeFunc);
                        break;
                    default: Logging_1.logger.warn(`Unknown method for route ${route}: ${routeItem.options.method}`);
                }
            });
            return router;
        };
        this.routeForMethod = (controllerItem, routeItem) => {
            const params = Register_1.paramsFor(controllerItem.controller, routeItem.property);
            const authentication = routeItem.options.authentication || controllerItem.options.authentication;
            return (req, res) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let user = null;
                    if (authentication) {
                        user = yield this.authentication.authenticate(authentication, req);
                        if (!user) {
                            return res.status(401).json({ error: 'Unauthorized' });
                        }
                    }
                    req.auth = this.authentication;
                    req.challenge = this.challengeAuthentication;
                    req.params = req.params || {};
                    const args = [];
                    params.forEach((param) => {
                        args[param.options.index] = ((type) => {
                            switch (type) {
                                case 'req': return req;
                                case 'res': return res;
                                case 'user':
                                    if (!param.options.optional && !user) {
                                        throw new HttpError_1.InvalidParamsError('Missing user');
                                    }
                                    return user;
                                case 'body':
                                    if (!param.options.optional && !req.body) {
                                        throw new HttpError_1.InvalidParamsError('Missing body');
                                    }
                                    return req.body;
                                case 'param':
                                    const value = req.params[param.options.name];
                                    if (!param.options.optional && !value) {
                                        throw new HttpError_1.InvalidParamsError(`Parameter ${param.options.name} missing`);
                                    }
                                    return value;
                            }
                        })(param.options.type);
                    });
                    const instance = this.container ? this.container.get(controllerItem.controller) : typedi_1.Container.get(controllerItem.controller);
                    const method = instance[routeItem.property].bind(instance);
                    const result = yield method(...args);
                    if (typeof result === 'object') {
                        res.json(result);
                    }
                    else if (result) {
                        res.send(result);
                    }
                }
                catch (error) {
                    if (error instanceof HttpError_1.HttpError) {
                        res.status(error.status).json({ error: error.message });
                    }
                    else {
                        Logging_1.logger.error('Request error:', error.stack);
                        res.status(500).json({ error: 'An internal error occured' });
                    }
                }
            });
        };
        this.httpConfig.host = this.httpConfig.host || 'localhost';
        this.httpConfig.controllers = this.httpConfig.controllers || [];
        this.httpConfig.customRoutes = this.httpConfig.customRoutes || [];
        this.httpConfig.accessControl = this.httpConfig.accessControl || {};
        this.httpConfig.fileSizeLimit = this.httpConfig.fileSizeLimit || '5mb';
        this.app = express();
        this.authentication = new RestAuthentication_1.RestAuthentication(this.httpConfig.auth);
        if (this.httpConfig.challenge) {
            this.challengeAuthentication = new ChallengeAuthentication_1.ChallengeAuthentication(this.app.locals, this.httpConfig.challenge);
        }
        this.app.use(Logging_1.logger.httpLogger(httpConfig.logFormat, httpConfig.logLevel))
            .use(bodyParser.json({ limit: this.httpConfig.fileSizeLimit }))
            .use(bodyParser.urlencoded({ extended: true, limit: this.httpConfig.fileSizeLimit }))
            .use(cookieParser())
            .enable('strict routing');
        const allowedHeaders = (httpConfig.accessControl.allowHeaders || ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']).join(',');
        const allowedMethods = (httpConfig.accessControl.allowMethods || ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE']).join(',');
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', this.httpConfig.accessControl.allowOrigin || '');
            res.header('Access-Control-Allow-Headers', allowedHeaders);
            res.header('Access-Control-Allow-Methods', allowedMethods);
            next();
        });
        this.container = container || typedi_1.Container.of(undefined);
        if (container) {
            Register_1.registerForContainer(container);
        }
        this.registerControllers();
        this.app.use(httpConfig.apiPath, (req, res) => {
            res.status(403).send({ error: 'Forbidden' });
        });
        const publicPath = path.join(Restype.rootPath, this.httpConfig.publicPath);
        Logging_1.logger.info('Public path:', publicPath);
        this.app.use(express.static(publicPath, { dotfiles: 'ignore', etag: true, immutable: true, maxAge: '1h' }));
        this.httpConfig.customRoutes.forEach((routeInfo) => {
            this.app.use(routeInfo.route, routeInfo.handler);
        });
        this.app.get('*', (req, res) => {
            res.status(404).send();
        });
    }
    static useLogger(loggerToUse) {
        Logging_1.logger.setLogger(loggerToUse);
    }
    static get rootPath() {
        return path.dirname(process.argv[1]);
    }
}
exports.Restype = Restype;
