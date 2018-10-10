import { Router } from 'express';
import { ContainerInstance } from 'typedi';
import { RestAuthentication } from '../authentication/RestAuthentication';
import { ControllerItem, RouteItem } from './Register';
export declare class RouterBuilder {
    private container;
    private authentication;
    constructor(container: ContainerInstance, authentication: RestAuthentication);
    build: (controllerItem: ControllerItem, routes: RouteItem[]) => Router;
    private routeForMethod;
}
