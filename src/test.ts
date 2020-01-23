import { EosClient } from './eosclient';

const sleep = (milliseconds:number ) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

// Check endpoints api version
(async () => {
  const endpoints_v2 = new Array<string>();
  for (let i = 0; i < EosClient.ENDPOINTS.length; i++) {
    const endpoint = EosClient.ENDPOINTS[i];
    const client = new EosClient({endpoint});
    const info = await client.getInfo();
    console.log(endpoint, !info ? "ERROR": info.server_version_string);
    if (info && info.server_version_string.includes("v2")) {
      endpoints_v2.push(endpoint);
    }
  }
  console.log(JSON.stringify(endpoints_v2, null, 2));
})();

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
