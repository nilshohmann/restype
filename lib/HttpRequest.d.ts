/// <reference types="node" />
import { IncomingHttpHeaders } from 'http';
export interface HttpReqest {
    headers?: IncomingHttpHeaders;
    body?: any;
}
