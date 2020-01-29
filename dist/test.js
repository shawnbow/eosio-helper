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
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};
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
// Recycle account
// interface IAccountJson {
//   name: string;
//   privateKey: string;
//   publicKey: string;
// }
// const payer_json: IAccountJson = require('./payer.json') as any;
// const account_json: IAccountJson = require('./account.json') as any;
// (async () => {
//   const private_keys = [payer_json.privateKey, account_json.privateKey];
//   const client = new EosClient({private_keys});
//   const accountInfo = await client.getAccount(account_json.name);
//   if (accountInfo === null) {
//     console.log(`${account_json.name} is NOT account`);
//     return;
//   }
//   // sellram
//   const { ram_quota, ram_usage } = accountInfo;
//   const ram_sellable = ram_quota - ram_usage - 16;
//   if (ram_sellable > 0) {
//     console.log(`${account_json.name} ram_sellable: ${ram_sellable} bytes`);
//     const result = await client.sellram(account_json.name, ram_sellable,
//       [
//         {
//           actor: payer_json.name,
//           permission: "active",
//         },
//         {
//           actor: account_json.name,
//           permission: "active",
//         },
//       ]
//     );
//     console.log(`sellram ${account_json.name} ${ram_sellable} bytes - ${result}`);
//     await sleep(5000);
//   }
//   // get back balance
//   const { balance: left_balance } = await client.getBalance("eosio.token", account_json.name, "EOS");
//   if (left_balance > 0) {
//     console.log(`${account_json.name} balance: ${left_balance.toFixed(4)} EOS`);
//     const result = await client.transfer(account_json.name, payer_json.name, `${left_balance.toFixed(4)} EOS`, "", "eosio.token",
//       [
//         {
//           actor: payer_json.name,
//           permission: "active",
//         },
//         {
//           actor: account_json.name,
//           permission: "active",
//         },
//       ]
//     );
//     console.log(`transfer ${account_json.name} ${left_balance.toFixed(4)} EOS - ${result}`);
//     await sleep(5000);
//   }
//   // unstake
//   const stakes = await client.getTableRows("eosio", account_json.name, "delband", { limit: 200 });
//   for (let i = 0; i < stakes.length; i++) {
//     const { from, to, net_weight, cpu_weight } = stakes[i];
//     console.log(`${from} - ${to} - net: ${net_weight} cpu: ${cpu_weight}`);
//     const result = await client.undelegatebw(from, to, net_weight, cpu_weight,
//       [
//         {
//           actor: payer_json.name,
//           permission: "active",
//         },
//         {
//           actor: account_json.name,
//           permission: "active",
//         },
//       ]
//     );
//     console.log(`unstake ${from} - ${to} - net: ${net_weight} cpu: ${cpu_weight} - ${result}`);
//   }
// })();
// Check vote stake
// async function checkVoteStake(check_from: string) {
//   const client = new EosClient({});
//   const rexbalRows = await client.getTableRows("eosio", "eosio", "rexbal", {
//     limit: 100, lower: check_from,
//   });
//   for (let i = 0; i < rexbalRows.length; i++) {
//     const rexbal = rexbalRows[i];
//     if (i == rexbalRows.length - 1) {
//       return rexbal.owner;
//     }
//     const voters = await client.getTableRows("eosio", "eosio", "voters", {
//       limit: 1, lower: rexbal.owner
//     });
//     if (voters.length == 0 || voters[0].owner !== rexbal.owner || voters[0].staked <= 0) {
//       continue;
//     }
//     const voter = voters[0];
//     const delegateRows = await client.getTableRows("eosio", voter.owner, "delband", {
//       limit: 200
//     });
//     const delegate = delegateRows.reduce((total, currentValue, currentIndex, arr)=>
//       {
//         return total + Math.floor(
//           parseFloat(currentValue.net_weight.split(' ')[0]) * 10000 +
//           parseFloat(currentValue.cpu_weight.split(' ')[0]) * 10000);
//       }, 0);
//     if (delegate > voter.staked) {
//       console.log(`checkVoteStake: ${voter.owner} voter.staked=${voter.staked} < net+cpu=${delegate}`);
//     }
//   }
//   console.log("all voters searched!!!");
//   return check_from;
// }
// (async () => {
//   let check_from = ".";
//   for (let i = 0; i < 10000; i++) {
//     console.log(`${i}: start to search from ${check_from}`);
//     check_from = await checkVoteStake(check_from);
//   }
// })();
//# sourceMappingURL=test.js.map