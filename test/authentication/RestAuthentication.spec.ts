import 'mocha';

import chai = require('chai');
import ChaiAsPromised = require('chai-as-promised');

import { RestAuthentication } from '../../src/authentication/RestAuthentication';
import { HttpReqest } from '../../src/HttpRequest';
import { Restype } from '../../src/Restype';

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

describe('RestAuthentication', () => {

  it('should return null if authentication type is not available', async () => {
    const authentication = new RestAuthentication({ basicAuthentication: undefined });
    const req: HttpReqest = { headers: { Authorization: 'Basic dGVzdDpwYXNzd29yZA==' } };

    return authentication.authenticate('basic', req).should.eventually.be.null;
  });

  it('should return null if authentication type is invalid', async () => {
    const authentication = new RestAuthentication({ basicAuthentication: () => Promise.resolve({} as any) });
    const req: HttpReqest = { headers: { Authorization: 'Basic dGVzdDpwYXNzd29yZA==' } };

    return authentication.authenticate('invalid' as any, req).should.eventually.be.null;
  });

  it('should return null if authentication info mismatches', async () => {
    const user = { name: 'TestUser' };
    const authentication = new RestAuthentication({ basicAuthentication: () => Promise.resolve(user as any) });
    const req: HttpReqest = { headers: { Authorization: 'Basic dGVzdDpwYXNzd29yZA==' } };

    return authentication.authenticate('basic', req).should.eventually.be.equal(user);
  });

});
