import { AuthenticationType } from '../authentication/RestAuthentication';
import { logger } from '../core/Logging';
import { registerRoute } from '../core/Register';

export declare type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RouteOptions {
  route?: string;
  authentication?: AuthenticationType;
}

export interface FullRouteOptions extends RouteOptions {
  method?: HttpMethod;
}

function extendOptions(options: RouteOptions, fullOptions: FullRouteOptions): FullRouteOptions {
  return {
    method: fullOptions.method,
    route: options.route || fullOptions.route,
    authentication: options.authentication || fullOptions.authentication
  };
}

function methodFor(property: string): HttpMethod {
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

function routeFor(property: string): string {
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

function prepareOptions(options: FullRouteOptions, property: string): RouteOptions {
  options.method = options.method || methodFor(property);
  options.route = options.route || routeFor(property);
  options.route = options.route.substring(0, 1) === '/' ? options.route : '/' + options.route;

  return options;
}

export function Route(options?: FullRouteOptions) {
  return (target: Object, property: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => {
    options = prepareOptions(options || {}, property);
    logger.debug(`${options.method} ${options.route} -> ${target.constructor.name}.${property}`);

    registerRoute(target, property, options);
  };
}

export function Get(options?: RouteOptions) {
  return Route(extendOptions(options || {}, { method: 'GET' }));
}

export function Head(options?: RouteOptions) {
  return Route(extendOptions(options || {}, { method: 'HEAD' }));
}

export function Post(options?: RouteOptions) {
  return Route(extendOptions(options || {}, { method: 'POST' }));
}

export function Put(options?: RouteOptions) {
  return Route(extendOptions(options || {}, { method: 'PUT' }));
}

export function Patch(options?: RouteOptions) {
  return Route(extendOptions(options || {}, { method: 'PATCH' }));
}

export function Delete(options?: RouteOptions) {
  return Route(extendOptions(options || {}, { method: 'DELETE' }));
}
