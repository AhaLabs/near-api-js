"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNEAR = exports.parseGas = void 0;
const near_units_1 = require("near-units");
const NOT_NUMBER_OR_UNDERLINE = /[^\d_]/;
function parseGas(s) {
    if (typeof s === 'string' && NOT_NUMBER_OR_UNDERLINE.test(s)) {
        return near_units_1.Gas.parse(s);
    }
    return near_units_1.Gas.from(s);
}
exports.parseGas = parseGas;
// One difference with `NEAR.parse` is that here strings of just numbers are considered `yN`
// And not `N`
function parseNEAR(s) {
    if (typeof s === 'string' && NOT_NUMBER_OR_UNDERLINE.test(s)) {
        return near_units_1.NEAR.parse(s);
    }
    return near_units_1.NEAR.from(s);
}
exports.parseNEAR = parseNEAR;
