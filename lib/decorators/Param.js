"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logging_1 = require("../core/Logging");
const Register_1 = require("../core/Register");
function Param(name, optional) {
    optional = !!optional;
    return (target, property, index) => {
        Logging_1.logger.debug(`Param ${target.constructor.name}.${property}[${index}:${name}] - ${optional}`);
        Register_1.registerParam(target, property, { type: 'param', index, name, optional });
    };
}
exports.Param = Param;
function Body(optional) {
    optional = !!optional;
    return (target, property, index) => {
        Logging_1.logger.debug(`Body ${target.constructor.name}.${property}[${index}] - ${optional}`);
        Register_1.registerParam(target, property, { type: 'body', index, name: null, optional });
    };
}
exports.Body = Body;
function Auth() {
    return (target, property, index) => {
        Logging_1.logger.debug(`Auth ${target.constructor.name}.${property}[${index}]`);
        Register_1.registerParam(target, property, { type: 'auth', index, name: null, optional: false });
    };
}
exports.Auth = Auth;
function CurrentUser(optional) {
    optional = !!optional;
    return (target, property, index) => {
        Logging_1.logger.debug(`CurrentUser ${target.constructor.name}.${property}[${index}] - ${optional}`);
        Register_1.registerParam(target, property, { type: 'user', index, name: null, optional });
    };
}
exports.CurrentUser = CurrentUser;
function Req() {
    return (target, property, index) => {
        Logging_1.logger.debug(`Req ${target.constructor.name}.${property}[${index}]`);
        Register_1.registerParam(target, property, { type: 'req', index, name: null, optional: false });
    };
}
exports.Req = Req;
function Res() {
    return (target, property, index) => {
        Logging_1.logger.debug(`Res ${target.constructor.name}.${property}[${index}]`);
        Register_1.registerParam(target, property, { type: 'res', index, name: null, optional: false });
    };
}
exports.Res = Res;
