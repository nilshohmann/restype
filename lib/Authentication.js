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
exports.globalAuthentication = {};
class Authenticator {
    constructor() {
        this.authenticate = (authenticationType, req) => __awaiter(this, void 0, void 0, function* () {
            const validator = this.getValidator(authenticationType);
            const authInfoExtractor = authInfoExtractors[authenticationType];
            if (!validator || !authInfoExtractor) {
                throw new Error(`No authentication validator available for '${authenticationType}'`);
            }
            const authInfo = authInfoExtractor(req);
            if (!authInfo) {
                return false;
            }
            return validator(...authInfo);
        });
        this.getValidator = (authenticationType) => {
            switch (authenticationType) {
                case 'basic': return exports.globalAuthentication.basicAuthentication;
                case 'jwt': return exports.globalAuthentication.jwtAuthentication;
            }
            return null;
        };
    }
}
exports.Authenticator = Authenticator;
function extractHeader(headerField, req) {
    const header = req.headers[headerField];
    if (typeof header === 'string') {
        return header;
    }
    else if (header && header.length === 1) {
        return header[0];
    }
    return null;
}
const authInfoExtractors = {
    basic: (req) => {
        const token = extractHeader('Authorization', req);
        if (!token || !token.match(/^Basic /)) {
            return null;
        }
        const credentials = Buffer.from(token.trimRight().replace(/^Basic */, ''), 'base64').toString().split(':');
        if (credentials.length !== 2) {
            return null;
        }
        return credentials;
    },
    jwt: (req) => {
        const token = extractHeader('x-access-token', req);
        if (!token) {
            return null;
        }
        try {
            return [jwt.verify(token, exports.globalAuthentication.jwtSecret)];
        }
        catch (_a) {
            return null;
        }
    },
};
