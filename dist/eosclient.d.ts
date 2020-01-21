import { Api, JsonRpc } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
export declare class EosClient {
    static readonly ENDPOINTS: string[];
    static readonly getRandomEndpoint: () => string;
    static readonly generteTransferActions: (from: string, to: string, quantity: string, memo: string, code: string, auths: {
        actor: string;
        permission: string;
    }[], num?: number) => any[];
    private _client;
    constructor(params: {
        endpoint?: string;
        signatureProvider?: JsSignatureProvider;
    });
    getRpc(): JsonRpc;
    getApi(): Api;
    getAccount(account: string): Promise<any>;
    getBalance(code: string, account: string, symbol: string): Promise<{
        balance: number;
        precision?: number;
    }>;
    getTableRows(code: string, scope: string, table: string, opts?: {
        lower?: string;
        upper?: string;
        limit?: number;
        index?: string;
        keyType?: string;
    }): Promise<any[]>;
    pushTransaction(actions: Array<any>, tx_opts?: any, push_opts?: any): Promise<boolean>;
    transfer(from: string, to: string, quantity: string, memo: string, code: string, auths: Array<{
        actor: string;
        permission: string;
    }>): Promise<boolean>;
    buyrambytes(payer: string, receiver: number, bytes: number, auths: Array<any>): Promise<boolean>;
    sellram(account: string, bytes: number, auths: Array<any>): Promise<boolean>;
    delegatebw(from: string, receiver: string, stake_net_quantity: string, stake_cpu_quantity: string, auths: Array<any>): Promise<boolean>;
    undelegatebw(from: string, receiver: string, unstake_net_quantity: string, unstake_cpu_quantity: string, auths: Array<any>): Promise<boolean>;
}
