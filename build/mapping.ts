//@ts-ignore
import { require } from "@hyperoracle/zkgraph-lib";
import { Bytes, Block,Event, BigInt } from "@hyperoracle/zkgraph-lib";

var esig_sync = Bytes.fromHexString(
  "0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1",
);

var token0_decimals = 8;
var token1_decimals = 18;
var price_decimals = 18;
var selector_syncCallback = Bytes.fromHexString("f4993018");

var token0_factor = BigInt.from(10).pow(token1_decimals);
var token1_factor = BigInt.from(10).pow(token0_decimals);
var price_factor = BigInt.from(10).pow(price_decimals);

function calcPrice(syncEvent: Event): BigInt {
  const source = changetype<Bytes>(syncEvent.data);
  const reserve0 = source.slice(0, 32);
  const reserve1 = source.slice(32, 64);

  const r0 = BigInt.fromBytes(reserve0);
  const r1 = BigInt.fromBytes(reserve1);
  let price0 = r0
    .times(token0_factor)
    .times(price_factor)
    .div(r1.times(token1_factor));

  return price0;
}

export function handleBlocks(blocks: Block[]): Bytes {
  let lastSyncEvent: Event | null = null;

  let events = blocks[0].events;

  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].esig == esig_sync) {
      //   console.log('SYNC event');
      lastSyncEvent = events[i];
      break;
    }
  }

  if (lastSyncEvent == null) {
    // Don't Trigger if there's no event in the block
    require(false);
    return Bytes.empty(); // Omit compile error, never goes here
  } else {
    let price0 = calcPrice(lastSyncEvent);

    // console.log("Current price is: " + (price0.toI64() / 10**price_decimals).toString() + "." + (price0.toI64() % 10**price_decimals).toString())

    // Set payload to the current price0 when triggering destination contract.
    let payload = selector_syncCallback.concat(Bytes.fromHexString(price0.toString(16)).padStart(32, 0));
    return Bytes.fromByteArray(payload);

  }
}
