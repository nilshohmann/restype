import 'mocha';

import chai = require('chai');
import ChaiAsPromised = require('chai-as-promised');

import * as jwt from 'jsonwebtoken';
import { JWTAuthenticator } from '../../src/authentication/JWTAuthenticator';
import { HttpReqest } from '../../src/core/HttpRequest';

before(() => {
  chai.should();
  chai.use(ChaiAsPromised);
});

describe('JWTAuthenticator', () => {

  it('should return null if no authentication info is available', async () => {
    const authenticator = new JWTAuthenticator(() => Promise.resolve({} as any), undefined);
    const req: HttpReqest = { headers: {} };

    return authenticator.authenticate(req).should.eventually.be.null;
  });

  it('should return null if no authentication info is invalid', async () => {
    const authenticator = new JWTAuthenticator(() => Promise.resolve({} as any), undefined);
    const req: HttpReqest = { headers: { authorization: 'Bearer invalid' } };

    return authenticator.authenticate(req).should.eventually.be.null;
  });

  it('should return null if token is expired', async () => {
    const jwtSecret = 'TestSecret';
    const authenticator = new JWTAuthenticator(() => Promise.resolve({} as any), jwtSecret);

    const jwtToken = jwt.sign({ id: 'TestUser' }, jwtSecret, { expiresIn: 0 });
    const req: HttpReqest = { headers: { authorization: `Bearer ${jwtToken}` } };

    return authenticator.authenticate(req).should.eventually.be.null;
  });

  it('should return null if authentication info mismatches', async () => {
    const jwtSecret = 'TestSecret';
    const authenticator = new JWTAuthenticator(() => Promise.resolve(null), jwtSecret);

    const jwtToken = jwt.sign({ id: 'TestUser' }, jwtSecret, { expiresIn: 60 });
    const req: HttpReqest = { headers: { authorization: `Bearer ${jwtToken}` } };

    return authenticator.authenticate(req).should.eventually.be.null;
  });

  it('should return user if authentication info matches', async () => {
    const jwtSecret = 'TestSecret';
    const authenticator = new JWTAuthenticator((token: any) =>
      Promise.resolve(token.id === 'TestUser' ? { userid: token.id } as any : null), jwtSecret);

    const jwtToken = jwt.sign({ id: 'TestUser' }, jwtSecret, { expiresIn: 60 });
    const req: HttpReqest = { headers: { authorization: `Bearer ${jwtToken}` } };

    return authenticator.authenticate(req).should.eventually.not.be.null;
  });

});
