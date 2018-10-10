import { AuthenticationType } from '../authentication/RestAuthentication';
export declare type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export interface RouteOptions {
    route?: string;
    authentication?: AuthenticationType;
}
export interface FullRouteOptions extends RouteOptions {
    method?: HttpMethod;
}
export declare function Route(options?: FullRouteOptions): (target: Object, property: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => void;
export declare function Get(options?: RouteOptions): (target: Object, property: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => void;
export declare function Head(options?: RouteOptions): (target: Object, property: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => void;
export declare function Post(options?: RouteOptions): (target: Object, property: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => void;
export declare function Put(options?: RouteOptions): (target: Object, property: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => void;
export declare function Patch(options?: RouteOptions): (target: Object, property: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => void;
export declare function Delete(options?: RouteOptions): (target: Object, property: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => void;
