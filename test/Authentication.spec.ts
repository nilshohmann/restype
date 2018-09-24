import 'mocha';
import './helper';

import chai = require('chai');
import ChaiAsPromised = require('chai-as-promised');

import * as jwt from 'jsonwebtoken';
import { Authenticator } from '../src/Authentication';
import { Restype } from '../src/Restype';

before(() => {
    chai.should();
    chai.use(ChaiAsPromised);
});

describe('Authenticator', () => {
  let authenticator: Authenticator;

  beforeEach(() => {
    authenticator = new Authenticator();
  });

  it('should throw error on missing validator', async () => {
    return authenticator.authenticate('unknown' as any, {})
      .should.eventually.be.rejectedWith('No authentication validator available for \'unknown\'');
  });

  describe('basic', () => {

    it('should return false if no authentication info is available', async () => {
      Restype.auth.basicAuthentication = () => Promise.resolve({} as any);

      return authenticator.authenticate('basic', { headers: {} }).should.eventually.be.false;
    });

    it('should return false if authentication info mismatches', async () => {
      Restype.auth.basicAuthentication = () => Promise.resolve(null);

      return authenticator.authenticate('basic', { headers: { Authorization: 'Basic dGVzdDpwYXNzd29yZA==' } }).should.eventually.be.false;
    });

    it('should return true if authentication info matches', async () => {
      Restype.auth.basicAuthentication = (username: string, password: string) =>
        Promise.resolve(username === 'test' && password === 'password' ? { username, password } as any : null);

      return authenticator.authenticate('basic', { headers: { Authorization: 'Basic dGVzdDpwYXNzd29yZA==' } }).should.eventually.be.true;
    });

  });

  describe('jwt', () => {

    it('should return false if no authentication info is available', async () => {
      Restype.auth.jwtAuthentication = () => Promise.resolve({} as any);

      return authenticator.authenticate('jwt', { headers: {} }).should.eventually.be.false;
    });

    it('should return false if no authentication info is invalid', async () => {
      Restype.auth.jwtAuthentication = () => Promise.resolve({} as any);

      return authenticator.authenticate('jwt', { headers: { 'x-access-token': 'invalid' } }).should.eventually.be.false;
    });

    it('should return false if token is expired', async () => {
      Restype.auth.jwtSecret = 'TestSecret';
      Restype.auth.jwtAuthentication = () => Promise.resolve({} as any);
      const jwtToken = jwt.sign({ id: 'TestUser' }, Restype.auth.jwtSecret, { expiresIn: 0 });

      return authenticator.authenticate('jwt', { headers: { 'x-access-token': jwtToken } }).should.eventually.be.false;
    });

    it('should return false if authentication info mismatches', async () => {
      Restype.auth.jwtSecret = 'TestSecret';
      Restype.auth.jwtAuthentication = () => Promise.resolve(null);
      const jwtToken = jwt.sign({ id: 'TestUser' }, Restype.auth.jwtSecret, { expiresIn: 60 });

      return authenticator.authenticate('jwt', { headers: { 'x-access-token': jwtToken } }).should.eventually.be.false;
    });

    it('should return true if authentication info matches', async () => {
      Restype.auth.jwtSecret = 'TestSecret';
      Restype.auth.jwtAuthentication = (token: any) =>
        Promise.resolve(token.id === 'TestUser' ? { userid: token.id } as any : null);
      const jwtToken = jwt.sign({ id: 'TestUser' }, Restype.auth.jwtSecret, { expiresIn: 60 });

      return authenticator.authenticate('jwt', { headers: { 'x-access-token': jwtToken } }).should.eventually.be.true;
    });

  });

});
