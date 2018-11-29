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
const express_1 = require("express");
const typedi_1 = require("typedi");
const HttpError_1 = require("./HttpError");
const Logging_1 = require("./Logging");
const Register_1 = require("./Register");
class RouterBuilder {
    constructor(container, authentication) {
        this.container = container;
        this.authentication = authentication;
        this.build = (controllerItem, routes) => {
            const router = express_1.Router();
            routes.forEach((routeItem) => {
                const routeFunc = this.routeForMethod(controllerItem, routeItem);
                const route = controllerItem.options.route + routeItem.options.route;
                const routeMatcher = this.routeMatcherFor(routeItem.options.method, router);
                if (!routeMatcher) {
                    Logging_1.logger.warn(`Unknown method for route ${route}: ${routeItem.options.method}`);
                }
                else {
                    routeMatcher(route, routeFunc);
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
                    req.params = req.params || {};
                    const args = [];
                    params.forEach((param) => {
                        args[param.options.index] = ((type) => {
                            switch (type) {
                                case 'req':
                                    return req;
                                case 'res':
                                    return res;
                                case 'auth':
                                    return this.authentication;
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
                    const instance = this.container
                        ? this.container.get(controllerItem.controller)
                        : typedi_1.default.get(controllerItem.controller);
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
    }
    routeMatcherFor(method, router) {
        switch (method) {
            case 'GET':
                return router.get;
            case 'HEAD':
                return router.head;
            case 'POST':
                return router.post;
            case 'PUT':
                return router.put;
            case 'PATCH':
                return router.patch;
            case 'DELETE':
                return router.delete;
            default:
                return null;
        }
    }
}
exports.RouterBuilder = RouterBuilder;
