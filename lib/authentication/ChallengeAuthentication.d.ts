import { ChallengeConfig } from '../HttpConfig';
export declare const challengeStorageKey = "restype_challenge_storage";
export interface Challenge {
    random: string;
    validUntil: number;
}
interface ChallengeViewData {
    challenge?: string;
    username?: string;
    hash?: string;
}
export declare class ChallengeAuthentication {
    private config;
    private storage;
    constructor(locals: any, config: ChallengeConfig);
    private validateEntries;
    create: (challengeExpiration?: number) => Promise<string>;
    verify: (viewData: ChallengeViewData) => Promise<true>;
}
export {};
