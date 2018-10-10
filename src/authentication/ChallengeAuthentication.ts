import { createHash, randomBytes } from 'crypto';

import { AuthConfig } from '../core/HttpConfig';
import { AccessDeniedError } from '../core/HttpError';
import { Credentials } from './Credentials';

export const challengeStorageKey = 'restype_challenge_storage';
const defaultChallengeExpiration = 30000;

export interface Challenge {
  random: string;
  validUntil: number;
}

export interface ChallengeViewData {
  /**
   * Previously generated challenge value
   */
  challenge: string;

  /**
   * Name of the user to be authenticated
   */
  username: string;

  /**
   * Base64 result of the challenge result
   * sha256(username:challenge:password)
   */
  hash?: string;
}

export class ChallengeAuthentication {

  private storage: { [id: string]: Challenge } = {};

  constructor(private config: AuthConfig) {
    this.config.challengeExpirationDuration = +this.config.challengeExpirationDuration || defaultChallengeExpiration;
  }

  private validateEntries = (): void => {
    for (const key in this.storage) {
      const challenge = this.storage[key];
      if (!challenge || challenge.validUntil < Date.now()) {
        delete this.storage[key];
      }
    }
  }

  create = async (challengeExpiration?: number): Promise<Challenge> => {
    challengeExpiration = +challengeExpiration || this.config.challengeExpirationDuration;

    const random = randomBytes(30).toString('base64');
    const validUntil = Date.now() + challengeExpiration;
    const challenge: Challenge = { random, validUntil };

    this.storage[random] = challenge;
    return challenge;
  }

  verify = async (viewData: ChallengeViewData, credentials: Credentials): Promise<true> => {
    this.validateEntries();

    const challenge = this.storage[viewData.challenge];
    if (!challenge) {
      throw new AccessDeniedError();
    }

    if (!this.validate(viewData.hash, `${viewData.username}:${viewData.challenge}:${credentials.password}`)) {
      throw new AccessDeniedError();
    }
    return true;
  }

  private validate = (challengeHash: string, data: string): boolean => {
    const hash = createHash('sha256');
    hash.update(data);
    return challengeHash === hash.digest('base64');
  }

}
