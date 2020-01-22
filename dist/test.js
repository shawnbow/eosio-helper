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
const eosclient_1 = require("./eosclient");
// Check endpoints api version
(() => __awaiter(void 0, void 0, void 0, function* () {
    const endpoints_v2 = new Array();
    for (let i = 0; i < eosclient_1.EosClient.ENDPOINTS.length; i++) {
        const endpoint = eosclient_1.EosClient.ENDPOINTS[i];
        const client = new eosclient_1.EosClient({ endpoint });
        const info = yield client.getInfo();
        console.log(endpoint, !info ? "ERROR" : info.server_version_string);
        if (info && info.server_version_string.includes("v2")) {
            endpoints_v2.push(endpoint);
        }
    }
    console.log(JSON.stringify(endpoints_v2, null, 2));
}))();
//# sourceMappingURL=test.js.map