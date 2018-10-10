import 'mocha';
import '../helper';

import chai = require('chai');
import { expect } from 'chai';
import ChaiAsPromised = require('chai-as-promised');

import { createHash } from 'crypto';
import { ChallengeAuthentication, challengeStorageKey } from '../../src/authentication/ChallengeAuthentication';
import { Credentials } from '../../src/authentication/Credentials';

before(() => {
  chai.should();
  chai.use(ChaiAsPromised);
});

describe('ChallengeAuthentication', () => {

  describe('create', () => {

    it('should return a new challenge', async () => {
      const challengeAuthentication = new ChallengeAuthentication({});

      const challenge = await challengeAuthentication.create();

      return expect(challenge).to.not.be.empty;
    });

    it('should store a new challenge', async () => {
      const challengeAuthentication = new ChallengeAuthentication({});

      await challengeAuthentication.create();
      await challengeAuthentication.create();

      const storage = (challengeAuthentication as any).storage;
      return expect(Object.keys(storage)).to.have.lengthOf(2);
    });

  });

  describe('verify', () => {

    it('should throw error if challenge does not exist', async () => {
      const credentials: Credentials = { username: 'TestUser', password: 'password' };
      const challengeAuthentication = new ChallengeAuthentication({});

      const hash = sha256(`TestUser:not_existing:wrong`);
      const viewData = { challenge: '', hash, username: 'TestUser' };
      return challengeAuthentication.verify(viewData, credentials).should.eventually.be.rejectedWith('Access denied');
    });

    it('should throw error for incorrect password challenge', async () => {
      const credentials: Credentials = { username: 'TestUser', password: 'password' };
      const challengeAuthentication = new ChallengeAuthentication({});

      const challenge = await challengeAuthentication.create();

      const hash = sha256(`TestUser:${challenge.random}:wrong`);
      const viewData = { challenge: challenge.random, hash, username: 'TestUser' };
      return challengeAuthentication.verify(viewData, credentials).should.eventually.be.rejectedWith('Access denied');
    });

    it('should throw error for expired challenge', async () => {
      const credentials: Credentials = { username: 'TestUser', password: 'password' };
      const challengeAuthentication = new ChallengeAuthentication({ challengeExpirationDuration: 1 });

      const challenge = await challengeAuthentication.create();
      await Promise.sleep(0.01);

      const hash = sha256(`TestUser:${challenge.random}:password`);
      const viewData = { challenge: challenge.random, hash, username: 'TestUser' };
      return challengeAuthentication.verify(viewData, credentials).should.eventually.be.rejectedWith('Access denied');
    });

    it('should return true for correct password challenge', async () => {
      const credentials: Credentials = { username: 'TestUser', password: 'password' };
      const challengeAuthentication = new ChallengeAuthentication({});

      const challenge = await challengeAuthentication.create();

      const hash = sha256(`TestUser:${challenge.random}:password`);
      const viewData = { challenge: challenge.random, hash, username: 'TestUser' };
      return challengeAuthentication.verify(viewData, credentials).should.eventually.be.true;
    });

  });

});

function sha256(data: string): string {
  const hash = createHash('sha256');
  hash.update(data);
  return hash.digest('base64');
}
