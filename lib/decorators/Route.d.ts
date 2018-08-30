export declare type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export interface RouteOptions {
    method?: HttpMethod;
    route?: string;
}
export declare function Route(options?: RouteOptions): (target: Object, property: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => void;
export declare function Get(route?: string): (target: Object, property: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => void;
export declare function Post(route?: string): (target: Object, property: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => void;
export declare function Put(route?: string): (target: Object, property: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => void;
export declare function Delete(route?: string): (target: Object, property: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => void;
