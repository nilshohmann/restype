"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logging_1 = require("../Logging");
const Register_1 = require("../Register");
function methodFor(property) {
    switch (property) {
        case 'create': return 'POST';
        case 'update': return 'PUT';
        case 'delete': return 'DELETE';
        default: return 'GET';
    }
}
function routeFor(property) {
    switch (property) {
        case 'findAll':
        case 'create': return '/';
        case 'findOne':
        case 'update':
        case 'delete': return '/:id(\\d+)';
        default: return '/' + property;
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
function Get(route, authentication) {
    const options = { method: 'GET', authentication, route };
    return Route(options);
}
exports.Get = Get;
function Head(route, authentication) {
    const options = { method: 'HEAD', authentication, route };
    return Route(options);
}
exports.Head = Head;
function Post(route, authentication) {
    const options = { method: 'POST', authentication, route };
    return Route(options);
}
exports.Post = Post;
function Put(route, authentication) {
    const options = { method: 'PUT', authentication, route };
    return Route(options);
}
exports.Put = Put;
function Patch(route, authentication) {
    const options = { method: 'PATCH', authentication, route };
    return Route(options);
}
exports.Patch = Patch;
function Delete(route, authentication) {
    const options = { method: 'DELETE', authentication, route };
    return Route(options);
}
exports.Delete = Delete;
