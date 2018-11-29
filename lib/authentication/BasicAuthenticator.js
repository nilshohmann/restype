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
const Authenticator_1 = require("./Authenticator");
class BasicAuthenticator {
    constructor(validator) {
        this.validator = validator;
        this.authenticate = (req) => __awaiter(this, void 0, void 0, function* () {
            const header = Authenticator_1.getAuthenticationHeader(req);
            if (!header || header.type !== 'basic') {
                return null;
            }
            const credentials = Buffer.from(header.value, 'base64')
                .toString()
                .split(':');
            if (credentials.length !== 2) {
                return null;
            }
            return this.validator(credentials[0], credentials[1]);
        });
    }
}
exports.BasicAuthenticator = BasicAuthenticator;
