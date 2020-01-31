import { createDfuseClient, DfuseClient } from "@dfuse/client";
(global as any).fetch = require('node-fetch');
(global as any).WebSocket = require("ws");

const DFUSE_NETWORK = "mainnet";
const DFUSE_API_KEY = "server_02b0bdd456c275db1da49b099bee0a7f";

export class Dfuse {
  private _client: DfuseClient;
  constructor () {
    this._client = createDfuseClient({
      network: DFUSE_NETWORK,
      apiKey: DFUSE_API_KEY,
    });
  }

  close() {
    this._client.release();
  }

  async fetchBlockIdByTime(date: Date) {
    const { block } = await this._client.fetchBlockIdByTime(date, "lte");
    return block.num;
  }

  async fetchKeyAccounts(publicKey: string, blockNum?: number): Promise<string[]> {
    const options = { blockNum, json: true };
    try {
      const resp = await this._client.stateKeyAccounts(
        publicKey,
        options
      );
      return (resp as any).account_names || [];
    } catch (e) {
      return [];
    }
  }

  async fetchBalance(code: string, account: string, symbol: string, blockNum?: number): Promise<{ balance: number, precision?: number }> {
    const options = { blockNum, json: true };
    try {
      const resp = await this._client.stateTableRow<{ balance: string }>(
        code,
        account,
        "accounts",
        symbol,
        options
      );
      return resp.row && resp.row.json ? {
          balance: parseFloat(resp.row.json.balance.split(' ')[0]),
          precision: resp.row.json.balance.split(' ')[0].split(".")[1].length,
        } : {
          balance: 0,
        };
    } catch (e) {
      return { balance: 0 };
    }
  }
}
