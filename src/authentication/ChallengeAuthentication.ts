import * as bcrypt from 'bcryptjs';

import { ChallengeConfig } from '../HttpConfig';
import { AccessDeniedError } from '../HttpError';

export const challengeStorageKey = 'restype_challenge_storage';
const defaultChallengeExpiration = 30000;

export interface Challenge {
  random: string;
  validUntil: number;
}

interface ChallengeViewData {
  challenge?: string;
  username?: string;
  hash?: string;
}

export class ChallengeAuthentication {

  private storage: { [id: string]: Challenge; };

  constructor(locals: any, private config: ChallengeConfig) {
    this.config.challengeExpirationDuration = +this.config.challengeExpirationDuration || defaultChallengeExpiration;

    if (!locals[challengeStorageKey]) {
      locals[challengeStorageKey] = {};
    }

    this.storage = locals[challengeStorageKey];
  }

  private validateEntries = (): void => {
    for (const key in this.storage) {
      const challenge = this.storage[key];
      if (!challenge || challenge.validUntil < Date.now()) {
        delete this.storage[key];
      }
    }
  }

  create = async (challengeExpiration?: number): Promise<string> => {
    challengeExpiration = +challengeExpiration || this.config.challengeExpirationDuration;

    const random = (await bcrypt.genSalt()).substr(-21) + (await bcrypt.genSalt()).substr(-21);
    const validUntil = Date.now() + challengeExpiration;

    const challenge: Challenge = { random, validUntil };

    this.storage[random] = challenge;
    return random;
  }

  verify = async (viewData: ChallengeViewData): Promise<true> => {
    this.validateEntries();

    const challenge = this.storage[viewData.challenge];
    if (!challenge) {
      throw new AccessDeniedError();
    }

    const credentials = await this.config.credentialsQuery(viewData.username);
    if (!credentials) {
      throw new AccessDeniedError();
    }

    const valid = await bcrypt.compare(`${viewData.username}:${viewData.challenge}:${credentials.password}`, viewData.hash);
    if (!valid) {
      throw new AccessDeniedError();
    }
    return true;
  }

}
