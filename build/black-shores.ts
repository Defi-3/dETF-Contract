//@ts-ignore
import { require } from "../lib/common/zkwasm";
import { Bytes, Event } from "../lib/common/type";

export function handleEvents(events: Event[]): Bytes {
    var source = changetype<Bytes>(events[0].data);
    let reserve0 = source.slice(31, 32);
    let reserve1 = source.slice(63, 64);
    let S = 100;
    let K = 120;
    let r = 0.01;
    let v = 1;
    let t = 100;

    const d1 = (Math.log(S / K) + (r + (v * v) / 2) * t) / (v * Math.sqrt(t));
    const d2 = d1 - v * Math.sqrt(t);

    const N1 = 0.5 * (1 + erf(d1 / Math.sqrt(2)));
    const N2 = 0.5 * (1 + erf(d2 / Math.sqrt(2)));

    const callPrice = S * N1 - K * Math.exp(-r * t) * N2;

    let state = new Bytes(32);
    state[31] = reserve0.toU32() / reserve1.toU32();
    return state;
}

export function erf(x: f64): f64 {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1.0 : -1.0;
    const absX = Math.abs(x);
    const t = 1.0 / (1.0 + p * absX);
    const y = (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t;

    const res = 1.0 - (y * Math.exp(-absX * absX));
    return sign * res;
}

export function handleEvent(esig: Uint8Array, topic1: Uint8Array, topic2: Uint8Array, topic3: Uint8Array, data: Uint8Array): Uint8Array {
    
}
