import { logger } from '../Logging';
import { registerRoute } from '../Register';

export declare type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RouteOptions {
  method?: HttpMethod;
  route?: string;
}

function methodFor(property: string): HttpMethod {
  switch (property) {
    case 'create': return 'POST';
    case 'update': return 'PUT';
    case 'delete': return 'DELETE';
    default: return 'GET';
  }
}

function routeFor(property: string): string {
  switch (property) {
    case 'findAll': case 'create': return '/';
    case 'findOne': case 'update': case 'delete': return '/:id(\\d+)';
    default: return '/' + property;
  }
}

function prepareOptions(options: RouteOptions, property: string): RouteOptions {
  options.method = options.method || methodFor(property);
  options.route = options.route || routeFor(property);
  options.route = options.route.substring(0, 1) === '/' ? options.route : '/' + options.route;

  return options;
}

export function Route(options?: RouteOptions) {

  return (target: Object, property: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => {
    options = prepareOptions(options || {}, property);
    logger.debug(`${options.method} ${options.route} -> ${target.constructor.name}.${property}`);

    registerRoute(target, property, options);
  };

}

export function Get(route?: string) {
  const options: RouteOptions = { method: 'GET', route };
  return Route(options);
}

export function Head(route?: string) {
  const options: RouteOptions = { method: 'HEAD', route };
  return Route(options);
}

export function Post(route?: string) {
  const options: RouteOptions = { method: 'POST', route };
  return Route(options);
}

export function Put(route?: string) {
  const options: RouteOptions = { method: 'PUT', route };
  return Route(options);
}

export function Patch(route?: string) {
  const options: RouteOptions = { method: 'PATCH', route };
  return Route(options);
}

export function Delete(route?: string) {
  const options: RouteOptions = { method: 'DELETE', route };
  return Route(options);
}
