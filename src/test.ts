import { EosClient } from './eosclient';

(async () => {
  const client = new EosClient({});
  console.log(client.getRpc().endpoint);
  const info = await client.getInfo();
  console.log(JSON.stringify(info, null, 2));
})();

