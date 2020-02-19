import nodeFetch from 'node-fetch';
import { TextDecoder, TextEncoder } from 'util';
import {Api, JsonRpc} from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
import { isValidPrivate } from 'eosjs-ecc';
import { Serialize, Numeric } from 'eosjs';

export class EosClient {
  static readonly ENDPOINTS_V2 = [
    "https://api.eosdetroit.io",
    "https://api.eosnewyork.io",
    "https://api.helloeos.com.cn",
    "https://mainnet.meet.one",
    "https://mainnet-tw.meet.one",
    "https://eospush.tokenpocket.pro",
    "http://openapi.eos.ren",
    "http://eos.newdex.one",
    "https://eos.newdex.one",
    "https://api.eoslaomao.com",
    "http://eos.eosphere.io",
    "https://eos.eosphere.io",
    "http://api.main.alohaeos.com",
    "https://api.main.alohaeos.com",
    "http://mainnet.eos.dfuse.io",
    "https://mainnet.eos.dfuse.io",
    "https://mainnet.eoscanada.com",
    "https://mainnet.libertyblock.io:7777",
    "http://api.tokenika.io",
    "https://api.tokenika.io",
    "http://api.eoseoul.io",
    "https://api.eoseoul.io",
    "http://node.eosflare.io",
    "https://node.eosflare.io",
    "http://eos.greymass.com",
    "https://eos.greymass.com",
    "http://api.eosn.io",
    "https://api.eosn.io",
    "https://nodes.get-scatter.com",
    "http://api.eossweden.se",
    "https://api.eossweden.se",
    "http://api.eossweden.org",
    "https://api.eossweden.org",
    // "http://api.eosrio.io",
    // "https://api.eosrio.io",
  ];

  static readonly ENDPOINTS_V1 = [
    "http://mainnet.genereos.io",
    "https://mainnet.genereos.io",
    "http://api.eosdublin.io",
    "https://api.eosdublin.io",
    "http://bp.cryptolions.io",
    "https://bp.cryptolions.io",
    "https://apinode.eosweb.net",
    "http://eos.eoscafeblock.com",
    "https://eos.eoscafeblock.com",
    "http://api-mainnet.starteos.io",
    "https://api-mainnet.starteos.io",
    "http://eos.infstones.io",
    "https://eos.infstones.io",
    "https://api.zbeos.com",
    "https://node1.zbeos.com",
    // "http://peer1.eoshuobipool.com:8181",
    // "http://peer2.eoshuobipool.com:8181",
    "https://eosbp.atticlab.net",
    "https://api1.eosasia.one",
  ];

  static readonly ENDPOINTS = [...EosClient.ENDPOINTS_V1, ...EosClient.ENDPOINTS_V2];

  static readonly nameToValue = (name: string): string => {
    const sb = new Serialize.SerialBuffer({
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder()
    });
    sb.pushName(name);
    return Numeric.signedBinaryToDecimal(sb.getUint8Array(8));
  }

  static readonly valueToName = (value: string): string => {
    const sb = new Serialize.SerialBuffer({
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder()
    });
    sb.pushArray(Numeric.signedDecimalToBinary(8, value));
    return sb.getName();
  }

  static readonly getRandomEndpoint = (v?: number): string => {
    if (v === 1) {
      const index = Math.floor(Math.random() * EosClient.ENDPOINTS_V1.length);
      return EosClient.ENDPOINTS_V1[index];
    } else if (v === 2) {
      const index = Math.floor(Math.random() * EosClient.ENDPOINTS_V2.length);
      return EosClient.ENDPOINTS_V2[index];
    } else {
      const index = Math.floor(Math.random() * EosClient.ENDPOINTS.length);
      return EosClient.ENDPOINTS[index];  
    }
  }

  static readonly makeActions = (code: string, action: string, data: any, auths: Array<{actor:string, permission: string}>, num: number = 1): Array<any> => {
    return Array(num).fill({
      account: code,
      name: action,
      authorization: auths,
      data,
    });
  }

  private _client: { rpc: JsonRpc, api?: Api };

  constructor( params: {endpoint?: string, private_keys?: Array<string>} ) {
    const {endpoint, private_keys} = params;

    let url: string;
    if (endpoint && endpoint.match(/(https?):[/]{2}([^:]*)(?::([\d]+))?/)) {
      url = endpoint;      
    } else {
      url = EosClient.getRandomEndpoint();
    }

    const rpc = new JsonRpc(url, { fetch: nodeFetch as any });
    if (private_keys) {
      private_keys.forEach((value)=>{
        if (!isValidPrivate(value)) {
          throw new Error('Error: private_key is invalid!');
        }
      });
      const api = new Api({
        rpc,
        signatureProvider: new JsSignatureProvider(private_keys),
        textDecoder: new TextDecoder(),
        textEncoder: new TextEncoder(),
      });
      this._client = { rpc, api };
    } else {
      this._client = { rpc };
    }
  }

  getRpc() {
    return this._client.rpc;
  }

  getApi() {
    return this._client.api;
  }

  async getInfo(): Promise<any> {
    try {
      return await this.getRpc().get_info();
    } catch (e) {
      console.error(e.toString());
      return null;
    }
  }

  async getAccount(account: string): Promise<any> {
    try {
      return await this.getRpc().get_account(account);
    } catch (e) {
      console.error(e.toString());
      return null;
    }
  }

  async getBalance(code:string, account: string, symbol:string): Promise<{balance: number, precision?: number}> {
    try {
      const balanceInfo = await this.getRpc().get_currency_balance(code, account, symbol);
      if (balanceInfo.length <= 0) return { balance: 0 };
      return {
        balance: parseFloat(balanceInfo[0].split(' ')[0]),
        precision: balanceInfo[0].split(' ')[0].split(".")[1].length,
      }
    } catch (e) {
      console.error(e.toString());
      return {
        balance: 0,
      }
    }
  }

  async getTableRows(code: string, scope: string, table: string,
    opts: {
      lower?: string;
      upper?: string;
      limit?: number;
      index?: string;
      keyType?: string;
    } = {}
  ): Promise<any[]> {
    const params: any = {
      code,
      scope,
      table,
      index_position: opts.index,
      key_type: opts.keyType,
      json: true
    };
  
    if (opts.lower) {
      params.lower_bound = opts.lower;
    }
    if (opts.upper) {
      params.upper_bound = opts.upper;
    }
    if (opts.limit) {
      params.limit = opts.limit;
    }
    try {
      const result = await this.getRpc().get_table_rows(params);
      return result.rows;
    } catch (e) {
      console.error(e.toString());
      return [];
    }
  }
  
  async pushTransaction(actions: Array<any>, tx_opts?: any, push_opts?: any): Promise<boolean> {
    if (this.getApi() === undefined) {
      console.error("eos api undefined");
      return false;
    }
    try {
      await this.getApi().transact(
      {
        ...tx_opts,
        actions: actions,
      },
      {
        blocksBehind: 3,
        expireSeconds: 300,
        ...push_opts,
      });
      return true;
    } catch (e) {
      console.error(e.json.error.code + '-' + e.json.error.name + '-' + e.json.error.what);
      return false;
    }
  }

  async transfer(from: string, to: string, quantity: string, memo: string, code: string, auths: Array<{actor:string, permission: string}>): Promise<boolean> {
    const actions = EosClient.makeActions(code, "transfer", { from, to, quantity, memo}, auths, 1);
    return await this.pushTransaction(actions);
  }

  async buyrambytes(payer: string, receiver: number, bytes: number, auths: Array<any>): Promise<boolean> {
    const actions = EosClient.makeActions('eosio', 'buyrambytes', { payer, receiver, bytes}, auths, 1);
    return await this.pushTransaction(actions);
  }

  async sellram(account: string, bytes: number, auths: Array<any>): Promise<boolean> {
    const actions = EosClient.makeActions('eosio', 'sellram', { account, bytes}, auths, 1);
    return await this.pushTransaction(actions);
  }

  async delegatebw(from: string, receiver: string, stake_net_quantity: string, stake_cpu_quantity: string, auths: Array<any>): Promise<boolean> {
    const actions = EosClient.makeActions('eosio', 'delegatebw', { from, receiver, stake_net_quantity, stake_cpu_quantity}, auths, 1);
    return await this.pushTransaction(actions);
  }

  async undelegatebw(from: string, receiver: string, unstake_net_quantity: string, unstake_cpu_quantity: string, auths: Array<any>): Promise<boolean> {
    const actions = EosClient.makeActions('eosio', 'undelegatebw', { from, receiver, unstake_net_quantity, unstake_cpu_quantity}, auths, 1);
    return await this.pushTransaction(actions);
  }
}
