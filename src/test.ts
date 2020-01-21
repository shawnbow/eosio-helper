import { EosClient } from './eosclient';

(async () => {
  const client = new EosClient({});
  const eosio_info = await client.getAccount("eosio");
  console.log(JSON.stringify(eosio_info, null, 2));
})();

