import { ObjectType } from 'typedi';
export interface ControllerOptions {
    route?: string;
    transient?: boolean;
    global?: boolean;
    id?: string;
}
export declare function Controller(options?: ControllerOptions): (target: ObjectType<any>) => void;
