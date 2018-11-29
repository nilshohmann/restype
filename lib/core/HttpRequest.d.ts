/// <reference types="node" />
import { IncomingHttpHeaders } from 'http';
export interface HttpReqest {
    cookies?: {
        [key: string]: any;
    };
    headers?: IncomingHttpHeaders;
    body?: any;
}
