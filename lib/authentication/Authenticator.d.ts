import { HttpReqest } from '../HttpRequest';
export interface Authenticator {
    authenticate: <User>(req: HttpReqest) => Promise<User | null>;
}
export declare function getAuthenticationHeader(req: HttpReqest): {
    type: string;
    value: string;
};
