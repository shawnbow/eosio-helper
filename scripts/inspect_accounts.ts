import { Dfuse } from '../src/dfuse';
import { EosClient } from '../src/eosclient';

async function get_accounts_by_pubkeys(publicKeys: string[]) : Promise<string[]> {
  // add pub keys here
  const dfuse = new Dfuse();
  let accounts = new Set<string>();
  for (let k of publicKeys) {
    try {
      const _accounts = await dfuse.fetchKeyAccounts(k);
      for (let a of _accounts) {
        accounts.add(a);
      }
    } catch (e) {
      console.log(k, 'fetch key accounts exception!');
    }
  }
  dfuse.close();
  return Array.from(accounts);
}

interface IAccountRich {
  account: string;
  balance: string;
  ram: number;
  voter_staked: string;
  stakes: Array<{
    from: string;
    to: string;
    total: string;
    net_weight: string;
    cpu_weight: string;
  }>;
  rex: string;
}

async function get_account_rich(account: string): Promise<IAccountRich> {
  const client = new EosClient({endpoint: "http://mainnet.eos.dfuse.io"});

  // get basic info
  const { core_liquid_balance, ram_quota, ram_usage, voter_info, rex_info } = await client.getAccount(account);
  let rich: IAccountRich = {
    account,
    balance: core_liquid_balance,
    ram: ram_quota - ram_usage - 16,
    voter_staked: voter_info ? `${(voter_info.staked/10000).toFixed(4)} EOS`: `0.0000 EOS`,
    stakes: [],
    rex: "0.0000 EOS",
  };

  // get stakes
  const stakes = await client.getTableRows("eosio", account, "delband", { limit: 200 });
  for (let i = 0; i < stakes.length; i++) {
    const { from, to, net_weight, cpu_weight } = stakes[i];
    const total = `${ (parseFloat(net_weight.split(' ')[0]) + parseFloat(cpu_weight.split(' ')[0])).toFixed(4) } EOS`;
    rich.stakes.push({ from, to, total, net_weight, cpu_weight });
  }

  // get rexbal and rexfund
  let rexbal = rex_info ? rex_info.vote_stake : "0.0000 EOS";
  let rexfund: string;
  const rexfund_rows = await client.getTableRows("eosio", "eosio", "rexfund", {
    limit: 1, lower: account, keyType: "name",
  });
  if (rexfund_rows.length == 0 || rexfund_rows[0].owner !== account) {
    rexfund = "0.0000 EOS";
  } else {
    rexfund = rexfund_rows[0].balance;
  }
  rich.rex = `${(parseFloat(rexbal.split(' ')[0]) + parseFloat(rexfund.split(' ')[0])).toFixed(4)} EOS`;
  return rich;
}

(async () => {
  let accounts: string[];
  try {
    accounts = require('../localstorage/accounts.json') as any;
  } catch (e) {
    console.log(e);
    accounts = [];
  }

  try {
    const publicKeys: string[] = require('../localstorage/keys.json') as any;
    if (publicKeys) {
      const _accounts = await get_accounts_by_pubkeys(publicKeys);
      accounts.push(..._accounts);
    }
  } catch (e) {
    console.log(e);
  }

  let riches: Array<IAccountRich> = [];
  for (let a of accounts) {
    console.log(`fetching ${a} ...`);
    const rich = await get_account_rich(a);
    riches.push(rich);
  }
  console.log(JSON.stringify(riches, null, 2));
})();
