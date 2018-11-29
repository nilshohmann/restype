import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { Express } from 'express';
import { createServer, Server } from 'http';
import * as path from 'path';
import { Container, ContainerInstance } from 'typedi';

import { RestAuthentication } from '../authentication/RestAuthentication';
import { HttpConfig } from './HttpConfig';
import { logger, LoggerType } from './Logging';
import { controllerFor, registerForContainer, routesFor } from './Register';
import { RouterBuilder } from './RouterBuilder';

/**
 * Basic web server setup.
 */
export class Restype {
  private server: Server;
  private authentication: RestAuthentication;

  public static useLogger(loggerToUse: LoggerType) {
    logger.setLogger(loggerToUse);
  }

  public static get rootPath(): string {
    return path.dirname(process.argv[1]);
  }

  public constructor(private config: HttpConfig, private container?: ContainerInstance, private app?: Express) {
    this.config = this.prepareConfig(config);

    this.app = this.app || express();

    // Setup logger, body-parser and cookie-parser
    this.app
      .use(logger.httpLogger(this.config.logFormat, this.config.logLevel))
      .use(bodyParser.json({ limit: this.config.fileSizeLimit }))
      .use(bodyParser.urlencoded({ extended: true, limit: this.config.fileSizeLimit }))
      .use(cookieParser())
      .enable('strict routing');

    this.prepareAccessControl();

    this.authentication = new RestAuthentication(this.config.auth);

    // Setup container, use global container by default
    this.container = this.container || Container.of(undefined);
    if (this.container) {
      registerForContainer(this.container);
    }

    this.registerControllers();

    // Block all remaining api paths
    this.app.use(this.config.apiPath, (req, res) => {
      res.status(403).send({ error: 'Forbidden' });
    });

    // Static assets folder
    const publicPath = path.join(Restype.rootPath, this.config.publicPath);
    logger.info('Public path:', publicPath);
    this.app.use(express.static(publicPath, { dotfiles: 'ignore', etag: true, immutable: true, maxAge: '1h' }));

    // Register custom handlers
    this.config.customRoutes.forEach((routeInfo) => {
      this.app.use(routeInfo.route, routeInfo.handler);
    });

    // Default to 404 result
    this.app.get('*', (req, res) => {
      res.status(404).send({ error: 'Not found' });
    });
  }

  private prepareConfig(config: HttpConfig): HttpConfig {
    config.host = config.host || 'localhost';
    config.port = config.port || 80;
    config.apiPath = config.apiPath || '/api';
    config.publicPath = config.publicPath || '/public';

    config.controllers = config.controllers || [];
    config.customRoutes = config.customRoutes || [];

    config.fileSizeLimit = config.fileSizeLimit || '5mb';
    config.accessControl = config.accessControl || {};
    config.auth = config.auth || {};

    config.logFormat = config.logFormat || '{{method}} {{url}} -> {{status}}, {{responseTime}} ms, {{contentLength}} byte';
    config.logLevel = config.logLevel || 'warn';

    return config;
  }

  private prepareAccessControl = (): void => {
    const config = this.config.accessControl;
    const allowOrigin = config.allowOrigin || '';
    const allowHeaders = Array.isArray(config.allowHeaders) ? config.allowHeaders.join(',') : config.allowHeaders || '*';
    const allowMethods = Array.isArray(config.allowMethods) ? config.allowMethods.join(',') : config.allowMethods || '*';

    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', allowOrigin);
      res.header('Access-Control-Allow-Headers', allowHeaders);
      res.header('Access-Control-Allow-Methods', allowMethods);
      res.header('Access-Control-Allow-Credentials', '' + !!config.allowCredentials);

      next();
    });
  };

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
            reject(new Error(`Port ${this.config.port} requires elevated privileges.`));
            break;
          case 'EADDRINUSE':
            reject(new Error(`Port ${this.config.port} is already in use.`));
            break;
          default:
            reject(error);
        }
      });

      this.server.listen(this.config.port, this.config.host);
    });
  };

  private registerControllers = () => {
    const routerBuilder = new RouterBuilder(this.container, this.authentication);

    this.config.controllers.forEach((controller) => {
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
      this.app.use(this.config.apiPath, routerBuilder.build(controllerInfo, routes));
    });
  };
}
