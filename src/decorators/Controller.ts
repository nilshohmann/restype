import { ObjectType } from 'typedi';

import { AuthenticationType } from '../authentication/RestAuthentication';
import { logger } from '../core/Logging';
import { registerController } from '../core/Register';

export interface ControllerOptions {
  route?: string;
  authentication?: AuthenticationType;
  transient?: boolean;
  global?: boolean;
  id?: string;
}

export function Controller(options?: ControllerOptions) {
  return (target: ObjectType<any>) => {
    options = options || {};
    options.global = options.global || false;

    const controllerName: string = target.prototype.constructor.name;
    options.route = options.route || '/' + controllerName.toLowerCase().replace(/controller$/, '');
    options.route = options.route.substring(0, 1) ? options.route : '/' + options.route;
    logger.debug(`Registering controller ${controllerName} at ${options.route}`);

    registerController(target, options);
  };
}
