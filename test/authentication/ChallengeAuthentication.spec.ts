import 'mocha';
import '../helper';

import chai = require('chai');
import { expect } from 'chai';
import ChaiAsPromised = require('chai-as-promised');

import * as bcrypt from 'bcryptjs';
import { Challenge, ChallengeAuthentication, challengeStorageKey } from '../../src/authentication/ChallengeAuthentication';

before(() => {
  chai.should();
  chai.use(ChaiAsPromised);
});

function challengesFor(locals: any): Challenge[] {
  if (!locals[challengeStorageKey]) {
    return [];
  }

  const storage: { [id: string]: Challenge; } = locals[challengeStorageKey];
  return Object.keys(storage).map(hash => storage[hash]);
}

describe('ChallengeAuthentication', () => {

  describe('create', () => {

    it('should return a new challenge', async () => {
      const locals: any = {};
      const config = { credentialsQuery: () => Promise.resolve(null) };
      const challengeAuthentication = new ChallengeAuthentication(locals, config);

      const challenge = await challengeAuthentication.create();

      return expect(challenge).to.not.be.empty;
    });

    it('should store a new challenge', async () => {
      const locals: any = {};
      const config = { credentialsQuery: () => Promise.resolve(null) };
      const challengeAuthentication = new ChallengeAuthentication(locals, config);

      await challengeAuthentication.create();

      return expect(Object.keys(locals[challengeStorageKey])).to.have.lengthOf(1);
    });

  });

  describe('verify', () => {

    it('should throw error if challenge does not exist', async () => {
      const locals: any = {};
      const config = { credentialsQuery: () => Promise.resolve({ username: 'TestUser', password: 'password' }) };
      const challengeAuthentication = new ChallengeAuthentication(locals, config);

      const hash = await bcrypt.hash(`TestUser:not_existing:wrong`, 10);
      const viewData = { challenge: '', hash, username: 'TestUser' };
      return challengeAuthentication.verify(viewData).should.eventually.be.rejectedWith('Access denied');
    });

    it('should throw error for not existing user', async () => {
      const locals: any = {};
      const config = { credentialsQuery: () => Promise.resolve(null) };
      const challengeAuthentication = new ChallengeAuthentication(locals, config);

      const challenge = await challengeAuthentication.create();

      const hash = await bcrypt.hash(`TestUser:${challenge}:password`, 10);
      const viewData = { challenge, hash, username: 'TestUser' };
      return challengeAuthentication.verify(viewData).should.eventually.be.rejectedWith('Access denied');
    });

    it('should throw error for incorrect password challenge', async () => {
      const locals: any = {};
      const config = { credentialsQuery: () => Promise.resolve({ username: 'TestUser', password: 'password' }) };
      const challengeAuthentication = new ChallengeAuthentication(locals, config);

      const challenge = await challengeAuthentication.create();

      const hash = await bcrypt.hash(`TestUser:${challenge}:wrong`, 10);
      const viewData = { challenge, hash, username: 'TestUser' };
      return challengeAuthentication.verify(viewData).should.eventually.be.rejectedWith('Access denied');
    });

    it('should throw error for expired challenge', async () => {
      const locals: any = {};
      const config = { credentialsQuery: () => Promise.resolve({ username: 'TestUser', password: 'password' }) };
      const challengeAuthentication = new ChallengeAuthentication(locals, config);

      const challenge = await challengeAuthentication.create(1);
      await Promise.sleep(0.01);

      const hash = await bcrypt.hash(`TestUser:${challenge}:password`, 10);
      const viewData = { challenge, hash, username: 'TestUser' };
      return challengeAuthentication.verify(viewData).should.eventually.be.rejectedWith('Access denied');
    });

    it('should return true for correct password challenge', async () => {
      const locals: any = {};
      const config = { credentialsQuery: () => Promise.resolve({ username: 'TestUser', password: 'password' }) };
      const challengeAuthentication = new ChallengeAuthentication(locals, config);

      const challenge = await challengeAuthentication.create();

      const hash = await bcrypt.hash(`TestUser:${challenge}:password`, 10);
      const viewData = { challenge, hash, username: 'TestUser' };
      return challengeAuthentication.verify(viewData).should.eventually.be.true;
    });

  });

});
