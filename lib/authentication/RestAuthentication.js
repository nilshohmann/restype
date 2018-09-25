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
const Logging_1 = require("../Logging");
const BasicAuthenticator_1 = require("./BasicAuthenticator");
const JWTAuthenticator_1 = require("./JWTAuthenticator");
class RestAuthentication {
    constructor(config) {
        this.authenticators = {};
        this.authenticate = (authenticationType, req) => __awaiter(this, void 0, void 0, function* () {
            const authenticator = this.authenticators[authenticationType];
            if (!authenticator) {
                Logging_1.logger.warn(`No authentication for type '${authenticationType}' found.`);
                return null;
            }
            return authenticator.authenticate(req);
        });
        this.createJWT = (payload) => {
            return JWTAuthenticator_1.JWTAuthenticator.createJWT(payload, this.config.jwtSecret);
        };
        this.config = config || {};
        if (typeof (this.config.basicAuthentication) === 'function') {
            this.authenticators['basic'] = new BasicAuthenticator_1.BasicAuthenticator(this.config.basicAuthentication);
        }
        if (typeof (this.config.jwtAuthentication) === 'function') {
            this.authenticators['jwt'] = new JWTAuthenticator_1.JWTAuthenticator(this.config.jwtAuthentication, this.config.jwtSecret);
        }
    }
}
exports.RestAuthentication = RestAuthentication;
