"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const util_1 = require("util");
const eosjs_1 = require("eosjs");
const eosjs_jssig_1 = require("eosjs/dist/eosjs-jssig");
const eosjs_ecc_1 = require("eosjs-ecc");
class EosClient {
    constructor(params) {
        const { endpoint, private_keys } = params;
        let url;
        if (endpoint && endpoint.match(/(https?):[/]{2}([^:]*)(?::([\d]+))?/)) {
            url = endpoint;
        }
        else {
            url = EosClient.getRandomEndpoint();
        }
        const rpc = new eosjs_1.JsonRpc(url, { fetch: node_fetch_1.default });
        if (private_keys) {
            private_keys.forEach((value) => {
                if (!eosjs_ecc_1.isValidPrivate(value)) {
                    throw new Error('Error: private_key is invalid!');
                }
            });
            const api = new eosjs_1.Api({
                rpc,
                signatureProvider: new eosjs_jssig_1.JsSignatureProvider(private_keys),
                textDecoder: new util_1.TextDecoder(),
                textEncoder: new util_1.TextEncoder(),
            });
            this._client = { rpc, api };
        }
        else {
            this._client = { rpc };
        }
    }
    getRpc() {
        return this._client.rpc;
    }
    getApi() {
        return this._client.api;
    }
    getInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.getRpc().get_info();
            }
            catch (e) {
                console.error(e.toString());
                return null;
            }
        });
    }
    getAccount(account) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.getRpc().get_account(account);
            }
            catch (e) {
                console.error(e.toString());
                return null;
            }
        });
    }
    getBalance(code, account, symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const balanceInfo = yield this.getRpc().get_currency_balance(code, account, symbol);
                if (balanceInfo.length <= 0)
                    return { balance: 0 };
                return {
                    balance: parseFloat(balanceInfo[0].split(' ')[0]),
                    precision: balanceInfo[0].split(' ')[0].split(".")[1].length,
                };
            }
            catch (e) {
                console.error(e.toString());
                return {
                    balance: 0,
                };
            }
        });
    }
    getTableRows(code, scope, table, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
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
                const result = yield this.getRpc().get_table_rows(params);
                return result.rows;
            }
            catch (e) {
                console.error(e.toString());
                return [];
            }
        });
    }
    pushTransaction(actions, tx_opts, push_opts) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.getApi() === undefined) {
                console.error("eos api undefined");
                return false;
            }
            try {
                yield this.getApi().transact(Object.assign(Object.assign({}, tx_opts), { actions: actions }), Object.assign({ blocksBehind: 3, expireSeconds: 300 }, push_opts));
                return true;
            }
            catch (e) {
                console.error(e.json.error.code + '-' + e.json.error.name + '-' + e.json.error.what);
                return false;
            }
        });
    }
    transfer(from, to, quantity, memo, code, auths) {
        return __awaiter(this, void 0, void 0, function* () {
            const actions = EosClient.makeActions(code, "transfer", { from, to, quantity, memo }, auths, 1);
            return yield this.pushTransaction(actions);
        });
    }
    buyrambytes(payer, receiver, bytes, auths) {
        return __awaiter(this, void 0, void 0, function* () {
            const actions = EosClient.makeActions('eosio', 'buyrambytes', { payer, receiver, bytes }, auths, 1);
            return yield this.pushTransaction(actions);
        });
    }
    sellram(account, bytes, auths) {
        return __awaiter(this, void 0, void 0, function* () {
            const actions = EosClient.makeActions('eosio', 'sellram', { account, bytes }, auths, 1);
            return yield this.pushTransaction(actions);
        });
    }
    delegatebw(from, receiver, stake_net_quantity, stake_cpu_quantity, auths) {
        return __awaiter(this, void 0, void 0, function* () {
            const actions = EosClient.makeActions('eosio', 'delegatebw', { from, receiver, stake_net_quantity, stake_cpu_quantity }, auths, 1);
            return yield this.pushTransaction(actions);
        });
    }
    undelegatebw(from, receiver, unstake_net_quantity, unstake_cpu_quantity, auths) {
        return __awaiter(this, void 0, void 0, function* () {
            const actions = EosClient.makeActions('eosio', 'undelegatebw', { from, receiver, unstake_net_quantity, unstake_cpu_quantity }, auths, 1);
            return yield this.pushTransaction(actions);
        });
    }
}
exports.EosClient = EosClient;
EosClient.ENDPOINTS_V2 = [
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
];
EosClient.ENDPOINTS_V1 = [
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
EosClient.ENDPOINTS = [...EosClient.ENDPOINTS_V1, ...EosClient.ENDPOINTS_V2];
EosClient.getRandomEndpoint = (v) => {
    if (v === 1) {
        const index = Math.floor(Math.random() * EosClient.ENDPOINTS_V1.length);
        return EosClient.ENDPOINTS_V1[index];
    }
    else if (v === 2) {
        const index = Math.floor(Math.random() * EosClient.ENDPOINTS_V2.length);
        return EosClient.ENDPOINTS_V2[index];
    }
    else {
        const index = Math.floor(Math.random() * EosClient.ENDPOINTS.length);
        return EosClient.ENDPOINTS[index];
    }
};
EosClient.makeActions = (code, action, data, auths, num = 1) => {
    return Array(num).fill({
        account: code,
        name: action,
        authorization: auths,
        data,
    });
};
//# sourceMappingURL=eosclient.js.map