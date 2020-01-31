import { EosClient } from '../src/eosclient';

// Check vote stake
async function checkVoteStake(check_from: string) {
  const client = new EosClient({endpoint: "http://mainnet.eos.dfuse.io"});
  const rexbalRows = await client.getTableRows("eosio", "eosio", "rexbal", {
    limit: 100, lower: check_from, keyType: "name",
  });

  for (let i = 0; i < rexbalRows.length; i++) {
    const rexbal = rexbalRows[i];
    if (i == rexbalRows.length - 1) {
      return rexbal.owner;
    }
    const voters = await client.getTableRows("eosio", "eosio", "voters", {
      limit: 1, lower: rexbal.owner
    });
    if (voters.length == 0 || voters[0].owner !== rexbal.owner || voters[0].staked <= 0) {
      continue;
    }
    const voter = voters[0];

    const delegateRows = await client.getTableRows("eosio", voter.owner, "delband", {
      limit: 200
    });
    const delegate = delegateRows.reduce((total, currentValue, currentIndex, arr)=>
      {
        return total + Math.floor(
          parseFloat(currentValue.net_weight.split(' ')[0]) * 10000 +
          parseFloat(currentValue.cpu_weight.split(' ')[0]) * 10000);
      }, 0);

    if (delegate > voter.staked) {
      console.log(`${voter.owner}: ${((delegate - voter.staked)/10000).toFixed(4)} EOS LOCKED - voter.staked=${voter.staked} < net+cpu=${delegate}`);
    }
  }
  console.log("all voters searched!!!");
  return check_from;
}

(async () => {
  let check_from = '1';
  for (let i = 0; i < 10000; i++) {
    // console.log(`${i}: start to search from ${check_from}`);
    check_from = await checkVoteStake(check_from);
  }
})();
