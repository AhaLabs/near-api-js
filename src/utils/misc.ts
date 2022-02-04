import BN from 'bn.js';
import { Gas, NEAR } from 'near-units';

const NOT_NUMBER_OR_UNDERLINE = /[^\d_]/;

export function parseGas(s: string | BN): Gas {
  if (typeof s === 'string' && NOT_NUMBER_OR_UNDERLINE.test(s)) {
    return Gas.parse(s);
  }

  return Gas.from(s);
}

// One difference with `NEAR.parse` is that here strings of just numbers are considered `yN`
// And not `N`
export function parseNEAR(s: string | BN): NEAR {
  if (typeof s === 'string' && NOT_NUMBER_OR_UNDERLINE.test(s)) {
    return NEAR.parse(s);
  }

  return NEAR.from(s);
}
