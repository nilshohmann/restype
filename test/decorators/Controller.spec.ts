import 'mocha';
import '../helper';

import chai = require('chai');
import ChaiAsPromised = require('chai-as-promised');
import { Container } from 'typedi';

import { HttpConfig } from '../../src/core/HttpConfig';
import { controllerFor } from '../../src/core/Register';
import { Restype } from '../../src/core/Restype';
import { Controller } from '../../src/decorators/Controller';

before(() => {
  chai.should();
  chai.use(ChaiAsPromised);

  Restype.useLogger({
    verbose: () => {},
    log: () => {},
    info: () => {},
    debug: () => {},
    warn: () => {},
    error: () => {},
  });
});

const httpConfig: HttpConfig = {
  port: 8080,
  host: 'localhost',
  apiPath: '/api',
  publicPath: '/',
  logFormat: '',
  logLevel: 'error',
};

describe('Controller', () => {
  beforeEach(() => {
    Container.reset();
  });

  describe('Registration', () => {
    it('should not find an unregistered controller', () => {
      class TestController {}

      return chai.expect(controllerFor(TestController)).to.be.undefined;
    });

    it('should register a controller', () => {
      @Controller()
      class TestController {}

      return chai.expect(controllerFor(TestController)).to.not.be.null;
    });
  });
});
