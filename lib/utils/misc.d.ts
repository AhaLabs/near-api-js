import BN from 'bn.js';
import { Gas, NEAR } from 'near-units';
export declare function parseGas(s: string | BN): Gas;
export declare function parseNEAR(s: string | BN): NEAR;
