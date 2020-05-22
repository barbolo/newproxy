/// <reference types="node" />
import * as http from 'http';
import { ExternalProxyFn } from '../types/functions/external-proxy-fn';
import { RequestOptions } from '../types/request-options';
import { ExternalProxyConfig } from '../types/external-proxy-config';
export declare function makeErr(message: string): never;
export declare class CommonUtils {
    static getOptionsFromRequest(req: http.IncomingMessage, ssl: boolean, externalProxy: ExternalProxyConfig | ExternalProxyFn | null): RequestOptions;
    private static getExternalProxyHelper;
    private static getTunnelAgent;
}
