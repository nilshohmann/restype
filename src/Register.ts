import { Container, ContainerInstance, ObjectType, ServiceMetadata } from 'typedi';

import { ControllerOptions } from './decorators/Controller';
import { RouteOptions } from './decorators/Route';

export interface ParamOptions { type: 'param' | 'body' | 'req' | 'res'; index: number; name: string; optional: boolean; }

export interface ControllerItem { controller: ObjectType<any>; options: ControllerOptions; }
export interface RouteItem { controllerType: any; property: string; options: RouteOptions; }
export interface ParamItem { controllerType: any; property: string; options: ParamOptions; }

const controllerList: ControllerItem[] = [];
const routeList: RouteItem[] = [];
const paramList: ParamItem[] = [];

function serviceFor<T, K extends keyof T>(type: ObjectType<any>, options: ControllerOptions): ServiceMetadata<T, K> {
  return {
    type,
    id: options.id,
    multiple: false,
    global: options.global || false,
    transient: options.transient === false ? false : true,
  };
}

export function registerForContainer(container: ContainerInstance) {
  controllerList.forEach((controllerItem) => {
    container.set(serviceFor(controllerItem.controller, controllerItem.options));
  });
}

export function registerController(controller: ObjectType<any>, options: ControllerOptions) {
  controllerList.push({ controller, options });

  Container.set(serviceFor(controller, options));
}

export function registerRoute(controllerType: any, property: string, options: RouteOptions) {
  routeList.push({ controllerType, property, options });
}

export function registerParam(controllerType: any, property: string, options: ParamOptions) {
  paramList.push({ controllerType, property, options });
}

export function controllerFor(type: ObjectType<any> | any): ControllerItem {
  type = typeof type === 'function' ? type.prototype : type;
  return controllerList.filter((item) => item.controller.prototype === type)[0];
}

export function routesFor(type: any): RouteItem[] {
  type = typeof type === 'function' ? type.prototype : type;
  return routeList.filter((item) => item.controllerType === type);
}

export function paramsFor(type: any, property: string): ParamItem[] {
  type = typeof type === 'function' ? type.prototype : type;
  return paramList.filter((item) => item.controllerType === type && item.property === property);
}
