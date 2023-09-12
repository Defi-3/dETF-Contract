//@ts-ignore
import { require } from "@hyperoracle/zkgraph-lib";
import { Bytes, Event, BigInt } from "@hyperoracle/zkgraph-lib";

var esig_swap = Bytes.fromHexString(
  "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67",
);

export function handleEvents(events: Event[]): Bytes {
  let lastSyncEvent: Event | null = null;

  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].esig == esig_swap) {
      lastSyncEvent = events[i];
      break;
    }
  }

  if (lastSyncEvent == null) {
    // Don't Trigger if there's no event in the block
    require(false);
    return Bytes.empty(); // Omit compile error, never goes here
  } else {
    const source = changetype<Bytes>(lastSyncEvent.data);
    const sqrtPriceX96 = source.slice(64, 96);

    const sqrtPriceBigInt = BigInt.fromBytesBigEndian(sqrtPriceX96);
    // sqrt ^ 2 / 2^192 * decimal adjustment
    const result = sqrtPriceBigInt.times(sqrtPriceBigInt).times(10 ** 6).div(2 ** 192);

    // rebalance(uint256)
    // f4993018cf1db379be1053b15816b2c65cb6d0fbf9e77cd3eeba21dd0e135cb5
    let params = Bytes.fromHexString(result.toString(16)).padStart(32, 0);
    let payload = Bytes.fromHexString("f4993018").concat(params);
    return Bytes.fromByteArray(payload);
  }
}
