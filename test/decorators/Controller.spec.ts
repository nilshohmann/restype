import 'mocha';
import '../helper';

import chai = require('chai');
import ChaiAsPromised = require('chai-as-promised');
import { Container } from 'typedi';

import { Controller } from '../../src/decorators/Controller';
import { HttpConfig } from '../../src/HttpConfig';
import { controllerFor } from '../../src/Register';
import { Restype } from '../../src/Restype';

before(() => {
    chai.should();
    chai.use(ChaiAsPromised);
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
    Restype.useLogger({
      verbose: () => {},
      log: () => {},
      info: () => {},
      debug: () => {},
      warn: () => {},
      error: () => {},
    });
  });

  describe('Registration', () => {
    it('should not find an unregistered controller', () => {
      class TestController { }

      return chai.expect(controllerFor(TestController)).to.be.undefined;
    });

    it('should register a controller', () => {
      @Controller()
      class TestController { }

      return chai.expect(controllerFor(TestController)).to.not.be.null;
    });
  });

});
