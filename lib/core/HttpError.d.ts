export declare class HttpError extends Error {
    status: number;
    constructor(status: number, message: string);
}
export declare class UnauthorizedError extends HttpError {
    constructor(message?: string);
}
export declare class AccessDeniedError extends HttpError {
    constructor(message?: string);
}
export declare class InvalidParamsError extends HttpError {
    constructor(message?: string);
}
