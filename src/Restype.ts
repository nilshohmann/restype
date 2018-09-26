import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { Express, Request as ExpressRequest, Response, Router } from 'express';
import { createServer, Server } from 'http';
import * as path from 'path';
import { Container, ContainerInstance } from 'typedi';

import { ChallengeAuthentication } from './authentication/ChallengeAuthentication';
import { RestAuthentication } from './authentication/RestAuthentication';
import { HttpConfig } from './HttpConfig';
import { HttpError, InvalidParamsError } from './HttpError';
import { logger, LoggerType } from './Logging';
import { controllerFor, ControllerItem, paramsFor, registerForContainer, RouteItem, routesFor } from './Register';

export interface Request extends ExpressRequest {

  auth: RestAuthentication;
  challenge: ChallengeAuthentication;

}

/**
 * Basic web server setup.
 */
export class Restype {

  private app: Express;
  private server: Server;
  private container: ContainerInstance;
  private authentication: RestAuthentication;
  private challengeAuthentication: ChallengeAuthentication;

  public static useLogger(loggerToUse: LoggerType) {
    logger.setLogger(loggerToUse);
  }

  public static get rootPath(): string {
    return path.dirname(process.argv[1]);
  }

  public constructor(private httpConfig: HttpConfig, container?: ContainerInstance) {
    this.httpConfig.host = this.httpConfig.host || 'localhost';
    this.httpConfig.controllers = this.httpConfig.controllers || [];
    this.httpConfig.customRoutes = this.httpConfig.customRoutes || [];
    this.httpConfig.accessControl = this.httpConfig.accessControl || {};
    this.httpConfig.fileSizeLimit = this.httpConfig.fileSizeLimit || '5mb';

    this.app = express();

    this.authentication = new RestAuthentication(this.httpConfig.auth);
    if (this.httpConfig.challenge) {
      this.challengeAuthentication = new ChallengeAuthentication(this.app.locals, this.httpConfig.challenge);
    }

    // Setup logger, body-parser and cookie-parser
    this.app.use(logger.httpLogger(httpConfig.logFormat, httpConfig.logLevel))
      .use(bodyParser.json({ limit: this.httpConfig.fileSizeLimit }))
      .use(bodyParser.urlencoded({ extended: true, limit: this.httpConfig.fileSizeLimit }))
      .use(cookieParser())
      .enable('strict routing');

    const allowedHeaders = (httpConfig.accessControl.allowHeaders || ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']).join(',');
    const allowedMethods = (httpConfig.accessControl.allowMethods || ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE']).join(',');
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', this.httpConfig.accessControl.allowOrigin || '');
      res.header('Access-Control-Allow-Headers', allowedHeaders); // ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'];
      res.header('Access-Control-Allow-Methods', allowedMethods); // 'GET, HEAD, POST, PUT, PATCH, DELETE');

      next();
    });

    // Setup container, use global container by default
    this.container = container || Container.of(undefined);
    if (container) {
      registerForContainer(container);
    }

    this.registerControllers();

    // Block all remaining api paths
    this.app.use(httpConfig.apiPath, (req, res) => {
      res.status(403).send({ error: 'Forbidden' });
    });

    // Static assets folder
    const publicPath = path.join(Restype.rootPath, this.httpConfig.publicPath);
    logger.info('Public path:', publicPath);
    this.app.use(express.static(publicPath, { dotfiles: 'ignore', etag: true, immutable: true, maxAge: '1h' }));

    // Register custom handlers
    this.httpConfig.customRoutes.forEach((routeInfo) => {
      this.app.use(routeInfo.route, routeInfo.handler);
    });

    // Default to 404 result
    this.app.get('*', (req, res) => {
      res.status(404).send();
    });
  }

  public start = (): Promise<Server> => {
    return new Promise((resolve, reject) => {
      this.server = createServer(this.app);

      this.server.on('listening', () => {
        resolve(this.server);
      });

      this.server.on('error', (error: Error | any) => {
        if (error.syscall !== 'listen') {
          logger.error('Server error:', error.stack);
          return;
        }

        switch (error.code) {
          case 'EACCES':
            reject(new Error(`Port ${this.httpConfig.port} requires elevated privileges.`));
            break;
          case 'EADDRINUSE':
            reject(new Error(`Port ${this.httpConfig.port} is already in use.`));
            break;
          default:
            reject(error);
        }
      });

      this.server.listen(this.httpConfig.port, this.httpConfig.host);
    });
  }

  private registerControllers = () => {
    this.httpConfig.controllers.forEach((controller) => {
      const controllerInfo = controllerFor(controller);
      if (!controllerInfo) {
        logger.warn('Controller not registered:', controller.prototype.constructor.name);
        return;
      }

      const routes = routesFor(controllerInfo.controller);
      if (!routes || !routes.length) {
        logger.warn('No routes for controller', controller.prototype.constructor.name);
        return;
      }

      logger.verbose('Registering controller:', controllerInfo.controller.prototype.constructor.name);
      this.app.use(this.httpConfig.apiPath, this.buildRouter(controllerInfo, routes));
    });
  }

  private buildRouter = (controllerItem: ControllerItem, routes: RouteItem[]): Router => {
    const router = Router();

    routes.forEach((routeItem) => {
      const routeFunc = this.routeForMethod(controllerItem, routeItem);
      const route = controllerItem.options.route + routeItem.options.route;

      switch (routeItem.options.method) {
        case 'GET': router.get(route, routeFunc); break;
        case 'HEAD': router.head(route, routeFunc); break;
        case 'POST': router.post(route, routeFunc); break;
        case 'PUT': router.put(route, routeFunc); break;
        case 'PATCH': router.patch(route, routeFunc); break;
        case 'DELETE': router.delete(route, routeFunc); break;
        default: logger.warn(`Unknown method for route ${route}: ${routeItem.options.method}`);
      }
    });

    return router;
  }

  private routeForMethod = (controllerItem: ControllerItem, routeItem: RouteItem): ((req: Request, res: Response) => void) => {
    const params = paramsFor(controllerItem.controller, routeItem.property);

    const authentication = routeItem.options.authentication || controllerItem.options.authentication;

    return async (req: Request, res: Response) => {
      try {
        let user: any = null;
        if (authentication) {
          user = await this.authentication.authenticate<any>(authentication, req);
          if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
          }
        }

        req.auth = this.authentication;
        req.challenge = this.challengeAuthentication;
        req.params = req.params || {};

        const args: any[] = [];
        params.forEach((param) => {
          args[param.options.index] = ((type: string) => {
            switch (type) {
              case 'req': return req;
              case 'res': return res;
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

        const instance = this.container ? this.container.get(controllerItem.controller) : Container.get(controllerItem.controller);
        const method: (...args: any[]) => Promise<any> = instance[routeItem.property].bind(instance);

        const result = await method(...args);
        if (typeof result === 'object') {
          res.json(result);
        } else if (result) {
          res.send(result);
        }
      } catch (error) {
        if (error instanceof HttpError) {
          res.status(error.status).json({ error: error.message  });
        } else {
          logger.error('Request error:', error.stack);
          res.status(500).json({ error: 'An internal error occured' });
        }
      }
    };
  }

}
