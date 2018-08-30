"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logging_1 = require("../Logging");
const Register_1 = require("../Register");
function Controller(options) {
    return (target) => {
        options = options || {};
        options.global = options.global || false;
        const controllerName = target.prototype.constructor.name;
        options.route = options.route || '/' + controllerName.toLowerCase().replace(/controller$/, '');
        options.route = options.route.substring(0, 1) ? options.route : '/' + options.route;
        Logging_1.logger.debug(`Registering controller ${controllerName} at ${options.route}`);
        Register_1.registerController(target, options);
    };
}
exports.Controller = Controller;
