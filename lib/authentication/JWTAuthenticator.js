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
const jwt = require("jsonwebtoken");
const Authenticator_1 = require("./Authenticator");
class JWTAuthenticator {
    constructor(validator, jwtSecret) {
        this.validator = validator;
        this.jwtSecret = jwtSecret;
        this.authenticate = (req) => __awaiter(this, void 0, void 0, function* () {
            const header = Authenticator_1.getAuthenticationHeader(req);
            if (header && header.type === 'bearer') {
                return this._authenticate(header.value);
            }
            const tokenHeader = req.cookies && req.cookies['access_token'];
            if (tokenHeader) {
                return this._authenticate(tokenHeader);
            }
            return null;
        });
        this._authenticate = (token) => {
            try {
                const rawToken = jwt.verify(token, this.jwtSecret);
                return this.validator(rawToken);
            }
            catch (_a) {
                return null;
            }
        };
    }
}
JWTAuthenticator.createJWT = (payload, jwtSecret) => {
    return jwt.sign(payload, jwtSecret);
};
exports.JWTAuthenticator = JWTAuthenticator;
