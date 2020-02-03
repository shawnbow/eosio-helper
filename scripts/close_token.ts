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
const token_json: any = require('../localstorage/token_contract.json') as any;
(async () => {
  const private_keys = [payer_json.privateKey, token_json.privateKey];
  const client = new EosClient({ endpoint: "http://mainnet.eos.dfuse.io", private_keys });

  let ret_scopes:any;
  try {
    ret_scopes = await client.getRpc().get_table_by_scope({ code: token_json.name, table: 'accounts', limit: 100 });
  } catch(e) {
    console.log(JSON.stringify(e, null, 2));
    return;
  }

  if (ret_scopes.rows === undefined || ret_scopes.rows.length == 0) {
    console.log("No accounts!");
    return;
  } else {
    console.log(JSON.stringify(ret_scopes.rows, null, 2));
  }

  const acts = ret_scopes.rows.map( (row: any) => { return {
    account: token_json.name,
    name: 'close',
    authorization: [
      {
        actor: payer_json.name,
        permission: 'active'
      },
      {
        actor: token_json.name,
        permission: 'active'
      },
    ],
    data: {
      owner: row.scope,
      symbol: token_json.symbol,
    },
  }});
  await client.pushTransaction(acts);
  await sleep(5000);
})();
