import { ContainerInstance, ObjectType } from 'typedi';
import { ControllerOptions } from './decorators/Controller';
import { RouteOptions } from './decorators/Route';
export interface ParamOptions {
    type: 'param' | 'body' | 'req' | 'res';
    index: number;
    name: string;
    optional: boolean;
}
export interface ControllerItem {
    controller: ObjectType<any>;
    options: ControllerOptions;
}
export interface RouteItem {
    controllerType: any;
    property: string;
    options: RouteOptions;
}
export interface ParamItem {
    controllerType: any;
    property: string;
    options: ParamOptions;
}
export declare function registerForContainer(container: ContainerInstance): void;
export declare function registerController(controller: ObjectType<any>, options: ControllerOptions): void;
export declare function registerRoute(controllerType: any, property: string, options: RouteOptions): void;
export declare function registerParam(controllerType: any, property: string, options: ParamOptions): void;
export declare function controllerFor(type: ObjectType<any> | any): ControllerItem;
export declare function routesFor(type: any): RouteItem[];
export declare function paramsFor(type: any, property: string): ParamItem[];
