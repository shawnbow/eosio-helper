export declare class Dfuse {
    private _client;
    constructor();
    close(): void;
    fetchBlockIdByTime(date: Date): Promise<number>;
    fetchKeyAccounts(publicKey: string, blockNum?: number): Promise<string[]>;
    fetchBalance(code: string, account: string, symbol: string, blockNum?: number): Promise<{
        balance: number;
        precision?: number;
    }>;
}
