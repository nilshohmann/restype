"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getAuthenticationHeader(req) {
    const header = getHeader('Authorization', req);
    if (!header) {
        return null;
    }
    const index = header.indexOf(' ');
    if (!index) {
        return { type: null, value: header };
    }
    return { type: header.substr(0, index).toLowerCase(), value: header.substr(index + 1).trim() };
}
exports.getAuthenticationHeader = getAuthenticationHeader;
function getHeader(headerField, req) {
    const header = req.headers[headerField];
    if (typeof header === 'string') {
        return header;
    }
    else if (header && header.length) {
        return header[0];
    }
    return null;
}
