import { EosClient } from './eosclient';

// Check endpoints api version
(async () => {
  const client = new EosClient({});
  const info = await client.getInfo();
  console.log(client.getRpc().endpoint, JSON.stringify(info, null, 2));
})();
