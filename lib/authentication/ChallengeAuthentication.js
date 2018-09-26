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
const bcrypt = require("bcryptjs");
const HttpError_1 = require("../HttpError");
exports.challengeStorageKey = 'restype_challenge_storage';
const defaultChallengeExpiration = 30000;
class ChallengeAuthentication {
    constructor(locals, config) {
        this.config = config;
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
            const random = (yield bcrypt.genSalt()).substr(-21) + (yield bcrypt.genSalt()).substr(-21);
            const validUntil = Date.now() + challengeExpiration;
            const challenge = { random, validUntil };
            this.storage[random] = challenge;
            return random;
        });
        this.verify = (viewData) => __awaiter(this, void 0, void 0, function* () {
            this.validateEntries();
            const challenge = this.storage[viewData.challenge];
            if (!challenge) {
                throw new HttpError_1.AccessDeniedError();
            }
            const credentials = yield this.config.credentialsQuery(viewData.username);
            if (!credentials) {
                throw new HttpError_1.AccessDeniedError();
            }
            const valid = yield bcrypt.compare(`${viewData.username}:${viewData.challenge}:${credentials.password}`, viewData.hash);
            if (!valid) {
                throw new HttpError_1.AccessDeniedError();
            }
            return true;
        });
        this.config.challengeExpirationDuration = +this.config.challengeExpirationDuration || defaultChallengeExpiration;
        if (!locals[exports.challengeStorageKey]) {
            locals[exports.challengeStorageKey] = {};
        }
        this.storage = locals[exports.challengeStorageKey];
    }
}
exports.ChallengeAuthentication = ChallengeAuthentication;
