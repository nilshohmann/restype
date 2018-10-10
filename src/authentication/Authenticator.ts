import { HttpReqest } from '../core/HttpRequest';

export interface Authenticator {

  authenticate: <User>(req: HttpReqest) => Promise<User | null>;

}

export function getAuthenticationHeader(req: HttpReqest): { type: string, value: string } {
  const header = getHeader('authorization', req);
  if (!header) {
    return null;
  }

  const index = header.indexOf(' ');
  if (!index) {
    return { type: null, value: header };
  }

  return { type: header.substr(0, index).toLowerCase(), value: header.substr(index + 1).trim() };
}

function getHeader(headerField: string, req: HttpReqest): string {
  const header = req.headers[headerField];
  if (typeof header === 'string') {
    return header;
  } else if (header && header.length) {
    return header[0];
  }
  return null;
}
