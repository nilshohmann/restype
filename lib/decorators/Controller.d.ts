import { ObjectType } from 'typedi';
import { AuthenticationType } from '../Authentication';
export interface ControllerOptions {
    route?: string;
    authentication?: AuthenticationType;
    transient?: boolean;
    global?: boolean;
    id?: string;
}
export declare function Controller(options?: ControllerOptions): (target: ObjectType<any>) => void;
