import { AuthenticationType } from '../Authentication';
export declare type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export interface RouteOptions {
    method?: HttpMethod;
    authentication?: AuthenticationType;
    route?: string;
}
export declare function Route(options?: RouteOptions): (target: Object, property: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => void;
export declare function Get(route?: string, authentication?: AuthenticationType): (target: Object, property: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => void;
export declare function Head(route?: string, authentication?: AuthenticationType): (target: Object, property: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => void;
export declare function Post(route?: string, authentication?: AuthenticationType): (target: Object, property: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => void;
export declare function Put(route?: string, authentication?: AuthenticationType): (target: Object, property: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => void;
export declare function Patch(route?: string, authentication?: AuthenticationType): (target: Object, property: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => void;
export declare function Delete(route?: string, authentication?: AuthenticationType): (target: Object, property: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => void;
