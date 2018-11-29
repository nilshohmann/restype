import { IRouterMatcher, Request, Response, Router } from 'express';
import Container, { ContainerInstance } from 'typedi';

import { RestAuthentication } from '../authentication/RestAuthentication';
import { HttpMethod } from '../decorators/Route';
import { HttpError, InvalidParamsError } from './HttpError';
import { logger } from './Logging';
import { ControllerItem, paramsFor, RouteItem } from './Register';

export class RouterBuilder {
  public constructor(private container: ContainerInstance, private authentication: RestAuthentication) {}

  public build = (controllerItem: ControllerItem, routes: RouteItem[]): Router => {
    const router = Router();

    routes.forEach((routeItem) => {
      const routeFunc = this.routeForMethod(controllerItem, routeItem);
      const route = controllerItem.options.route + routeItem.options.route;

      const routeMatcher = this.routeMatcherFor(routeItem.options.method, router);
      if (!routeMatcher) {
        logger.warn(`Unknown method for route ${route}: ${routeItem.options.method}`);
      } else {
        routeMatcher(route, routeFunc);
      }
    });

    return router;
  };

  private routeMatcherFor(method: HttpMethod, router: Router): IRouterMatcher<Router> {
    switch (method) {
      case 'GET':
        return router.get;
      case 'HEAD':
        return router.head;
      case 'POST':
        return router.post;
      case 'PUT':
        return router.put;
      case 'PATCH':
        return router.patch;
      case 'DELETE':
        return router.delete;
      default:
        return null;
    }
  }

  private routeForMethod = (controllerItem: ControllerItem, routeItem: RouteItem): ((req: Request, res: Response) => void) => {
    const params = paramsFor(controllerItem.controller, routeItem.property);

    const authentication = routeItem.options.authentication || controllerItem.options.authentication;

    return async (req: Request, res: Response) => {
      try {
        let user: any = null;
        if (authentication) {
          user = await this.authentication.authenticate<any>(authentication, req);
          if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
          }
        }

        req.params = req.params || {};

        const args: any[] = [];
        params.forEach((param) => {
          args[param.options.index] = ((type: string) => {
            switch (type) {
              case 'req':
                return req;
              case 'res':
                return res;
              case 'auth':
                return this.authentication;
              case 'user':
                if (!param.options.optional && !user) {
                  throw new InvalidParamsError('Missing user');
                }
                return user;
              case 'body':
                if (!param.options.optional && !req.body) {
                  throw new InvalidParamsError('Missing body');
                }
                return req.body;
              case 'param':
                const value = req.params[param.options.name];
                if (!param.options.optional && !value) {
                  throw new InvalidParamsError(`Parameter ${param.options.name} missing`);
                }
                return value;
            }
          })(param.options.type);
        });

        const instance = this.container
          ? this.container.get(controllerItem.controller)
          : Container.get(controllerItem.controller);
        const method: (...args: any[]) => Promise<any> = instance[routeItem.property].bind(instance);

        const result = await method(...args);
        if (typeof result === 'object') {
          res.json(result);
        } else if (result) {
          res.send(result);
        }
      } catch (error) {
        if (error instanceof HttpError) {
          res.status(error.status).json({ error: error.message });
        } else {
          logger.error('Request error:', error.stack);
          res.status(500).json({ error: 'An internal error occured' });
        }
      }
    };
  };
}
