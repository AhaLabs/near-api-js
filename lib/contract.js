"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contract = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const _1 = require(".");
const providers_1 = require("./providers");
const transaction_1 = require("./transaction");
const errors_1 = require("./utils/errors");
// Makes `function.name` return given name
function nameFunction(name, body) {
    return {
        [name](...args) {
            return body(...args);
        }
    }[name];
}
const isUint8Array = (x) => x && x.byteLength !== undefined && x.byteLength === x.length;
const isObject = (x) => Object.prototype.toString.call(x) === '[object Object]';
/**
 * Defines a smart contract on NEAR including the change (mutable) and view (non-mutable) methods
 *
 * @example {@link https://docs.near.org/docs/develop/front-end/naj-quick-reference#contract}
 * @example
 * ```js
 * import { Contract } from 'near-api-js';
 *
 * async function contractExample() {
 *   const methodOptions = {
 *     viewMethods: ['getMessageByAccountId'],
 *     changeMethods: ['addMessage']
 *   };
 *   const contract = new Contract(
 *     wallet.account(),
 *     'contract-id.testnet',
 *     methodOptions
 *   );
 *
 *   // use a contract view method
 *   const messages = await contract.getMessages({
 *     accountId: 'example-account.testnet'
 *   });
 *
 *   // use a contract change method
 *   await contract.addMessage({
 *      meta: 'some info',
 *      callbackUrl: 'https://example.com/callback',
 *      args: { text: 'my message' },
 *      amount: 1
 *   })
 * }
 * ```
 */
class Contract {
    /**
     * @param account NEAR account to sign change method transactions
     * @param contractId NEAR account id where the contract is deployed
     * @param options NEAR smart contract methods that your application will use. These will be available as `contract.methodName`
     */
    constructor(account, contractId, options) {
        this.account = account;
        this.contractId = contractId;
        const { viewMethods = [], changeMethods = [] } = options;
        viewMethods.forEach((methodName) => {
            Object.defineProperty(this, methodName, {
                writable: false,
                enumerable: true,
                value: nameFunction(methodName, async (args = {}, options = {}, ...ignored) => {
                    if (ignored.length || !(isObject(args) || isUint8Array(args)) || !isObject(options)) {
                        throw new errors_1.PositionalArgsError();
                    }
                    return this.account.viewFunction(this.contractId, methodName, args, options);
                })
            });
        });
        changeMethods.forEach((baseMethodName) => {
            ['', 'Raw', "Tx"].forEach((resultType) => {
                const methodName = `${baseMethodName}${resultType}`;
                Object.defineProperty(this, methodName, {
                    writable: false,
                    enumerable: true,
                    value: nameFunction(methodName, async (...args) => {
                        if (args.length && (args.length > 3 || !(isObject(args[0]) || isUint8Array(args[0])))) {
                            throw new errors_1.PositionalArgsError();
                        }
                        if (args.length >= 1 && !(isObject(args[0]) || isUint8Array(args[0]))) {
                            throw new errors_1.ArgumentTypeError("args", "object or Uint8Array", args[0]);
                        }
                        if (args.length >= 2 && !isObject(args[1])) {
                            throw new errors_1.ArgumentTypeError("options", "object", args[1]);
                        }
                        return this[`_changeMethod${resultType}`](baseMethodName, args[0], args[1]);
                    })
                });
            });
        });
    }
    _changeMethodRaw(methodName, args = {}, options = {}) {
        validateBNLike({ gas: options.gas, attachedDeposit: options.attachedDeposit });
        return this.account.functionCall({
            contractId: this.contractId,
            methodName,
            args,
            ...options,
        });
    }
    // @ts-ignore: is referenced
    async _changeMethod(methodName, args = {}, options) {
        const result = await this._changeMethodRaw(methodName, args, options);
        return providers_1.getTransactionLastResult(result);
    }
    // @ts-ignore: is referenced
    _functionCallTx(methodName, args = {}, options) {
        return transaction_1.functionCall(methodName, args, options.gas ?? _1.DEFAULT_FUNCTION_CALL_GAS, options.attachedDeposit ?? _1.NEAR.from(0));
    }
}
exports.Contract = Contract;
/**
 * Validation on arguments being a big number from bn.js
 * Throws if an argument is not in BN format or otherwise invalid
 * @param argMap
 */
function validateBNLike(argMap) {
    const bnLike = 'number, decimal string or BN';
    for (const argName of Object.keys(argMap)) {
        const argValue = argMap[argName];
        if (argValue && !bn_js_1.default.isBN(argValue) && isNaN(argValue)) {
            throw new errors_1.ArgumentTypeError(argName, bnLike, argValue);
        }
    }
}
