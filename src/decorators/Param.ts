import { logger } from '../core/Logging';
import { registerParam } from '../core/Register';

export function Param(name: string, optional?: boolean): Function {
  optional = !!optional;

  return (target: Object, property: string, index: number) => {
    logger.debug(`Param ${target.constructor.name}.${property}[${index}:${name}] - ${optional}`);

    registerParam(target, property, { type: 'param', index, name, optional });
  };
}

export function Body(optional?: boolean): Function {
  optional = !!optional;

  return (target: Object, property: string, index: number) => {
    logger.debug(`Body ${target.constructor.name}.${property}[${index}] - ${optional}`);

    registerParam(target, property, { type: 'body', index, name: null, optional });
  };
}

export function Auth(): Function {
  return (target: Object, property: string, index: number) => {
    logger.debug(`Auth ${target.constructor.name}.${property}[${index}]`);

    registerParam(target, property, { type: 'auth', index, name: null, optional: false });
  };
}

export function CurrentUser(optional?: boolean): Function {
  optional = !!optional;

  return (target: Object, property: string, index: number) => {
    logger.debug(`CurrentUser ${target.constructor.name}.${property}[${index}] - ${optional}`);

    registerParam(target, property, { type: 'user', index, name: null, optional });
  };
}

export function Req(): Function {
  return (target: Object, property: string, index: number) => {
    logger.debug(`Req ${target.constructor.name}.${property}[${index}]`);

    registerParam(target, property, { type: 'req', index, name: null, optional: false });
  };
}

export function Res(): Function {
  return (target: Object, property: string, index: number) => {
    logger.debug(`Res ${target.constructor.name}.${property}[${index}]`);

    registerParam(target, property, { type: 'res', index, name: null, optional: false });
  };
}
