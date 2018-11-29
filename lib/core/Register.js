"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const controllerList = [];
const routeList = [];
const paramList = [];
function serviceFor(type, options) {
    return {
        type,
        id: options.id,
        multiple: false,
        global: options.global || false,
        transient: options.transient === false ? false : true
    };
}
function registerForContainer(container) {
    controllerList.forEach((controllerItem) => {
        container.set(serviceFor(controllerItem.controller, controllerItem.options));
    });
}
exports.registerForContainer = registerForContainer;
function registerController(controller, options) {
    controllerList.push({ controller, options });
    typedi_1.Container.set(serviceFor(controller, options));
}
exports.registerController = registerController;
function registerRoute(controllerType, property, options) {
    routeList.push({ controllerType, property, options });
}
exports.registerRoute = registerRoute;
function registerParam(controllerType, property, options) {
    paramList.push({ controllerType, property, options });
}
exports.registerParam = registerParam;
function controllerFor(type) {
    type = typeof type === 'function' ? type.prototype : type;
    return controllerList.filter((item) => item.controller.prototype === type)[0];
}
exports.controllerFor = controllerFor;
function routesFor(type) {
    type = typeof type === 'function' ? type.prototype : type;
    return routeList.filter((item) => item.controllerType === type);
}
exports.routesFor = routesFor;
function paramsFor(type, property) {
    type = typeof type === 'function' ? type.prototype : type;
    return paramList.filter((item) => item.controllerType === type && item.property === property);
}
exports.paramsFor = paramsFor;
