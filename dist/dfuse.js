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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@dfuse/client");
global.fetch = require('node-fetch');
global.WebSocket = require("ws");
const DFUSE_NETWORK = "mainnet";
const DFUSE_API_KEY = "server_02b0bdd456c275db1da49b099bee0a7f";
class Dfuse {
    constructor() {
        this._client = client_1.createDfuseClient({
            network: DFUSE_NETWORK,
            apiKey: DFUSE_API_KEY,
        });
    }
    close() {
        this._client.release();
    }
    fetchBlockIdByTime(date) {
        return __awaiter(this, void 0, void 0, function* () {
            const { block } = yield this._client.fetchBlockIdByTime(date, "lte");
            return block.num;
        });
    }
    fetchKeyAccounts(publicKey, blockNum) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = { blockNum, json: true };
            try {
                const resp = yield this._client.stateKeyAccounts(publicKey, options);
                return resp.account_names || [];
            }
            catch (e) {
                return [];
            }
        });
    }
    fetchBalance(code, account, symbol, blockNum) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = { blockNum, json: true };
            try {
                const resp = yield this._client.stateTableRow(code, account, "accounts", symbol, options);
                return resp.row && resp.row.json ? {
                    balance: parseFloat(resp.row.json.balance.split(' ')[0]),
                    precision: resp.row.json.balance.split(' ')[0].split(".")[1].length,
                } : {
                    balance: 0,
                };
            }
            catch (e) {
                return { balance: 0 };
            }
        });
    }
}
exports.Dfuse = Dfuse;
//# sourceMappingURL=dfuse.js.map