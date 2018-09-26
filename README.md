# RESType

A simple REST server written in typescript, heavily relying on `express` as a http server and `typedi` as an injection framework. It uses decorators to define `Controller`, `Routes` and `Parameters`.

## Usage

```typescript
import { Restype } from 'restype';

let httpConfig = { ... };
httpConfig.controllers = [
  ProjectController, TestController,
];

import { Container } from 'typedi';
const container = Container.of(undefined);

const restype = new Restype(httpConfig, container)

restype.start().then((server) => {
    logger.info(`Server listening on ${httpConfig.host}:${httpConfig.port}.`);
}).catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
});
```

Restype provides basic decorators to define the server structure:

### Controller

`@Controller(options?: ControllerOptions)`

Defines a controller as a base for REST routes. The controllers also function as typedi Services and are resolved as such. Therefor injecting other services into the controller is possible.

The options contain

- an optional **route** path, the controller's class name (without trailing 'controller') is used if not provided - this does not work properly with webpack etc.)
- an **authentication** type (currently 'basic' or 'jwt')
- a **transient** flag used for typedi
- a **global** flag used for typedi
- an **id** used for typedi

### Routes

`@Route(options?: RouteOptions)`

Defines a route inside of a controller. A route consists of a http method and a path to access the route. Valid http methods are `GET`, `HEAD`, `POST`, `PUT`, `PATCH`, and `DELETE`. They all have convenience decorators ( e.g. `@Get(route?: string)` ) which only need an optional path parameter, defaulting to the decorated method's name if not provided. The route's path may also contain parameters in express style.

The decorator expects a method returning a `Promise` as a return value. The asynchronous result of the method is then returned to the http request. If the result is of type `object` it is automacally converted to a JSON string before beeing delivered.

### Paramters

A parameter decorator is used within the route methods to automatically inject parameters from the currrent http call. These include:

- `@Param(name: string, optional?: boolean)`
  - Injects a query parameter with the given name
- `@Body(optional?: boolean)`
  - Injects the request body
- `@User(optional?: boolean)`
  - Injects the authenticated user if available
- `@Req()`
  - Injects the raw express request
- `@Res()`
  - Injects the raw express response

## Example

An example of a RESType controller may look like this:

```typescript
import { Body, Controller, Get, Param, Post, Put, Res } from 'restype';

@Controller({ transient: true, route: '/projects' })
export class ProjectController {

  public constructor(private service: ProjectMaintainService) {}

  @Get('/:id')
  public async findOne(@Param('id') id: number) {
    return await this.service.findOne(+id);
  }

  @Get()
  public async findAll() {
    return await this.service.findAll();
  }

  @Get('/byName/:name')
  public async findByName(@Param('name') name: string) {
    return await this.service.findByName(name);
  }

  @Post()
  public async create(@Body() project: Project) {
    return await this.service.create(project);
  }

  @Put()
  public async update(@Param('id') id: number, @Body() project: Project) {
    return await this.service.update(+id, project);
  }

  @Get('/image/:id(\\d+)')
  public async image(@Res() res: Response, @Param('id') id: number) {
    const image = await this.service.imageFor(+id);
    if (image) {
      res.contentType(image.type);
      res.send(image.data);
    } else {
      res.redirect('/assets/images/project.jpg');
    }
  }
}
```

Please note that all parameters delivered via `@Param()` are strings and currently not converted to the desired type. Therefore it's recommended to explicitly convert the values to the given type (e.g. `+id` for numbers).

## Logging

Logging can be achieved by providing an logger extending `LoggerType` to the `userLogger( _ )`-method.

## License

RESType is available under the MIT license. See LICENSE file for more info.

## Troubleshooting

Feel free to commit improvements or error reports. Since this is just a small private project, it may take a little while for me to react to any input.

Thank you!