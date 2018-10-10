"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const HttpError_1 = require("../core/HttpError");
exports.challengeStorageKey = 'restype_challenge_storage';
const defaultChallengeExpiration = 30000;
class ChallengeAuthentication {
    constructor(config) {
        this.config = config;
        this.storage = {};
        this.validateEntries = () => {
            for (const key in this.storage) {
                const challenge = this.storage[key];
                if (!challenge || challenge.validUntil < Date.now()) {
                    delete this.storage[key];
                }
            }
        };
        this.create = (challengeExpiration) => __awaiter(this, void 0, void 0, function* () {
            challengeExpiration = +challengeExpiration || this.config.challengeExpirationDuration;
            const random = crypto_1.randomBytes(30).toString('base64');
            const validUntil = Date.now() + challengeExpiration;
            const challenge = { random, validUntil };
            this.storage[random] = challenge;
            return challenge;
        });
        this.verify = (viewData, credentials) => __awaiter(this, void 0, void 0, function* () {
            this.validateEntries();
            const challenge = this.storage[viewData.challenge];
            if (!challenge) {
                throw new HttpError_1.AccessDeniedError();
            }
            if (!this.validate(viewData.hash, `${viewData.username}:${viewData.challenge}:${credentials.password}`)) {
                throw new HttpError_1.AccessDeniedError();
            }
            return true;
        });
        this.validate = (challengeHash, data) => {
            const hash = crypto_1.createHash('sha256');
            hash.update(data);
            return challengeHash === hash.digest('base64');
        };
        this.config.challengeExpirationDuration = +this.config.challengeExpirationDuration || defaultChallengeExpiration;
    }
}
exports.ChallengeAuthentication = ChallengeAuthentication;
