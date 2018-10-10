import 'mocha';

import chai = require('chai');
import ChaiAsPromised = require('chai-as-promised');

import { BasicAuthenticator } from '../../src/authentication/BasicAuthenticator';
import { HttpReqest } from '../../src/core/HttpRequest';

before(() => {
  chai.should();
  chai.use(ChaiAsPromised);
});

describe('BasicAuthenticator', () => {

  it('should return null if no authentication info is available', async () => {
    const authenticator = new BasicAuthenticator(() => Promise.resolve({} as any));
    const req: HttpReqest = { headers: {} };

    return authenticator.authenticate(req).should.eventually.be.null;
  });

  it('should return null if authentication info mismatches', async () => {
    const authenticator = new BasicAuthenticator(() => Promise.resolve(null));
    const req: HttpReqest = { headers: { authorization: 'Basic dGVzdDpwYXNzd29yZA==' } };

    return authenticator.authenticate(req).should.eventually.be.null;
  });

  it('should return user if authentication info matches', async () => {
    const authenticator = new BasicAuthenticator((username: string, password: string) =>
      Promise.resolve(username === 'test' && password === 'password' ? { username, password } as any : null));
    const req: HttpReqest = { headers: { authorization: 'Basic dGVzdDpwYXNzd29yZA==' } };

    return authenticator.authenticate(req).should.eventually.not.be.null;
  });

});
