"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
exports.HttpError = HttpError;
class InvalidParamsError extends HttpError {
    constructor(message) {
        super(400, message || 'Invalid arguements');
    }
}
exports.InvalidParamsError = InvalidParamsError;
