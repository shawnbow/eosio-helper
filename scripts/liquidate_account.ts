import { EosClient } from '../src/eosclient';

const sleep = (milliseconds:number ) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

// liquidate account
interface IAccountJson {
  name: string;
  privateKey: string;
  publicKey: string;
}
const payer_json: IAccountJson = require('../localstorage/payer.json') as any;
const accounts_json: Array<IAccountJson> = require('../localstorage/liquidate_accounts.json') as any;
(async () => {
  for (let account_json of accounts_json) {
    const private_keys = [payer_json.privateKey, account_json.privateKey];
    const client = new EosClient({ endpoint: "http://mainnet.eos.dfuse.io", private_keys });

    const accountInfo = await client.getAccount(account_json.name);
    if (accountInfo === null) {
      console.log(`${account_json.name} is NOT account`);
      return;
    }

    // sellram
    const { ram_quota, ram_usage } = accountInfo;
    const ram_sellable = ram_quota - ram_usage - 16;
    if (ram_sellable > 0) {
      console.log(`${account_json.name} ram_sellable: ${ram_sellable} bytes`);
      const result = await client.sellram(account_json.name, ram_sellable,
        [
          {
            actor: payer_json.name,
            permission: "active",
          },
          {
            actor: account_json.name,
            permission: "active",
          },
        ]
      );
      console.log(`sellram ${account_json.name} ${ram_sellable} bytes - ${result}`);
      await sleep(5000);
    }

    // get back balance
    const { balance: left_balance } = await client.getBalance("eosio.token", account_json.name, "EOS");
    if (left_balance > 0) {
      console.log(`${account_json.name} balance: ${left_balance.toFixed(4)} EOS`);
      const result = await client.transfer(account_json.name, payer_json.name, `${left_balance.toFixed(4)} EOS`, "", "eosio.token",
        [
          {
            actor: payer_json.name,
            permission: "active",
          },
          {
            actor: account_json.name,
            permission: "active",
          },
        ]
      );
      console.log(`transfer ${account_json.name} ${left_balance.toFixed(4)} EOS - ${result}`);
      await sleep(5000);
    }

    // unstake
    const stakes = await client.getTableRows("eosio", account_json.name, "delband", { limit: 200 });
    for (let i = 0; i < stakes.length; i++) {
      const { from, to, net_weight, cpu_weight } = stakes[i];
      console.log(`${from} - ${to} - net: ${net_weight} cpu: ${cpu_weight}`);
      const result = await client.undelegatebw(from, to, net_weight, cpu_weight,
        [
          {
            actor: payer_json.name,
            permission: "active",
          },
          {
            actor: account_json.name,
            permission: "active",
          },
        ]
      );
      console.log(`unstake ${from} - ${to} - net: ${net_weight} cpu: ${cpu_weight} - ${result}`);
    }
  }
})();
