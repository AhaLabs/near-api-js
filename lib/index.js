"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
/** @ignore @module */
exports.keyStores = __importStar(require("./key_stores/index"));
__exportStar(require("./common-index"), exports);
__exportStar(require("./connect"), exports);
__exportStar(require("./constants"), exports);
var near_units_1 = require("near-units");
Object.defineProperty(exports, "NEAR", { enumerable: true, get: function () { return near_units_1.NEAR; } });
Object.defineProperty(exports, "Gas", { enumerable: true, get: function () { return near_units_1.Gas; } });
Object.defineProperty(exports, "parseUnits", { enumerable: true, get: function () { return near_units_1.parse; } });
