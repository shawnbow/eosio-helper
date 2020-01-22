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
(() => __awaiter(void 0, void 0, void 0, function* () {
    const client = new eosclient_1.EosClient({});
    console.log(client.getRpc().endpoint);
    const info = yield client.getInfo();
    console.log(JSON.stringify(info, null, 2));
}))();
//# sourceMappingURL=test.js.map