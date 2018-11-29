"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logging_1 = require("../core/Logging");
const Register_1 = require("../core/Register");
function extendOptions(options, fullOptions) {
    return {
        method: fullOptions.method,
        route: options.route || fullOptions.route,
        authentication: options.authentication || fullOptions.authentication
    };
}
function methodFor(property) {
    switch (property) {
        case 'create':
            return 'POST';
        case 'update':
            return 'PUT';
        case 'delete':
            return 'DELETE';
        default:
            return 'GET';
    }
}
function routeFor(property) {
    switch (property) {
        case 'findAll':
        case 'create':
            return '/';
        case 'findOne':
        case 'update':
        case 'delete':
            return '/:id(\\d+)';
        default:
            return '/' + property;
    }
}
function prepareOptions(options, property) {
    options.method = options.method || methodFor(property);
    options.route = options.route || routeFor(property);
    options.route = options.route.substring(0, 1) === '/' ? options.route : '/' + options.route;
    return options;
}
function Route(options) {
    return (target, property, descriptor) => {
        options = prepareOptions(options || {}, property);
        Logging_1.logger.debug(`${options.method} ${options.route} -> ${target.constructor.name}.${property}`);
        Register_1.registerRoute(target, property, options);
    };
}
exports.Route = Route;
function Get(options) {
    return Route(extendOptions(options || {}, { method: 'GET' }));
}
exports.Get = Get;
function Head(options) {
    return Route(extendOptions(options || {}, { method: 'HEAD' }));
}
exports.Head = Head;
function Post(options) {
    return Route(extendOptions(options || {}, { method: 'POST' }));
}
exports.Post = Post;
function Put(options) {
    return Route(extendOptions(options || {}, { method: 'PUT' }));
}
exports.Put = Put;
function Patch(options) {
    return Route(extendOptions(options || {}, { method: 'PATCH' }));
}
exports.Patch = Patch;
function Delete(options) {
    return Route(extendOptions(options || {}, { method: 'DELETE' }));
}
exports.Delete = Delete;
