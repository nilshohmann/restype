import { AuthConfig } from '../core/HttpConfig';
import { Credentials } from './Credentials';
export declare const challengeStorageKey = "restype_challenge_storage";
export interface Challenge {
    random: string;
    validUntil: number;
}
export interface ChallengeViewData {
    challenge: string;
    username: string;
    hash?: string;
}
export declare class ChallengeAuthentication {
    private config;
    private storage;
    constructor(config: AuthConfig);
    private validateEntries;
    create: (challengeExpiration?: number) => Promise<Challenge>;
    verify: (viewData: ChallengeViewData, credentials: Credentials) => Promise<true>;
    private validate;
}
