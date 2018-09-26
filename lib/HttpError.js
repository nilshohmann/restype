"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
exports.HttpError = HttpError;
class UnauthorizedError extends HttpError {
    constructor(message) {
        super(401, message || 'Unauthorized');
    }
}
exports.UnauthorizedError = UnauthorizedError;
class AccessDeniedError extends HttpError {
    constructor(message) {
        super(401, message || 'Access denied');
    }
}
exports.AccessDeniedError = AccessDeniedError;
class InvalidParamsError extends HttpError {
    constructor(message) {
        super(400, message || 'Invalid arguements');
    }
}
exports.InvalidParamsError = InvalidParamsError;
