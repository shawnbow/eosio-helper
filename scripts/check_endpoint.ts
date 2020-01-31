import { EosClient } from '../src/eosclient';

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
