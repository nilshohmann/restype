"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logging_1 = require("../Logging");
const Register_1 = require("../Register");
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
