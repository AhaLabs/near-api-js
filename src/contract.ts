import BN from 'bn.js';
import { DEFAULT_FUNCTION_CALL_GAS, NEAR } from '.';
import { Account } from './account';
import { getTransactionLastResult } from './providers';
import { functionCall } from './transaction';
import { PositionalArgsError, ArgumentTypeError } from './utils/errors';

// Makes `function.name` return given name
function nameFunction(name: string, body: (args?: any[]) => {}) {
    return {
        [name](...args: any[]) {
            return body(...args);
        }
    }[name];
}

const isUint8Array = (x: any) =>
    x && x.byteLength !== undefined && x.byteLength === x.length;

const isObject = (x: any) =>
    Object.prototype.toString.call(x) === '[object Object]';

export interface ChangeMethodOptions {
    gas?: BN;
    attachedDeposit?: BN;
    walletMeta?: string;
    walletCallbackUrl?: string;
}

export interface ContractMethods {
    /**
     * Methods that change state. These methods cost gas and require a signed transaction.
     * 
     * @see {@link Account.functionCall}
     */
    changeMethods: string[];

    /**
     * View methods do not require a signed transaction.
     * 
     * @@see {@link Account.viewFunction}
     */
    viewMethods: string[];
}

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
export class Contract {
    readonly account: Account;
    readonly contractId: string;

    /**
     * @param account NEAR account to sign change method transactions
     * @param contractId NEAR account id where the contract is deployed
     * @param options NEAR smart contract methods that your application will use. These will be available as `contract.methodName`
     */
    constructor(account: Account, contractId: string, options: ContractMethods) {
        this.account = account;
        this.contractId = contractId;
        const { viewMethods = [], changeMethods = [] } = options;
        viewMethods.forEach((methodName) => {
            Object.defineProperty(this, methodName, {
                writable: false,
                enumerable: true,
                value: nameFunction(methodName, async (args: object = {}, options = {}, ...ignored) => {
                    if (ignored.length || !(isObject(args) || isUint8Array(args)) || !isObject(options)) {
                        throw new PositionalArgsError();
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
                    value: nameFunction(methodName, (...args: any[]) => {
                      console.log(`_changeMethod${resultType}`)
                        if (args.length && (args.length > 3 || !(isObject(args[0]) || isUint8Array(args[0])))) {
                            throw new PositionalArgsError();
                        }
                        if(args.length >= 1 && !(isObject(args[0]) || isUint8Array(args[0]))) {
                          throw new ArgumentTypeError("args", "object or Uint8Array", args[0]);
                        } 
                        if (args.length >= 2 && !isObject(args[1])) {
                          throw new ArgumentTypeError("options", "object", args[1]);
                        }
                        return this[`_changeMethod${resultType}`](baseMethodName, args[0], args[1]);
                    })
                });
            });
        });
    }

    private _changeMethodRaw(methodName: string, args: object = {}, options: ChangeMethodOptions = {}) {
        validateBNLike({ gas: options.gas, attachedDeposit: options.attachedDeposit });
        return this.account.functionCall({
            contractId: this.contractId,
            methodName,
            args,
            ...options,
        });
    }
    
    // @ts-ignore: is referenced
    private async _changeMethod(methodName: string, args: object = {}, options: ChangeMethodOptions) {
        const result = await this._changeMethodRaw(methodName, args, options);
        return getTransactionLastResult(result);
    }

    // @ts-ignore: is referenced
    private _functionCallTx(methodName: string, args: object = {}, options: ChangeMethodOptions) {
      return functionCall(methodName, args, options.gas ?? DEFAULT_FUNCTION_CALL_GAS, options.attachedDeposit ?? NEAR.from(0))
    }

}

/**
 * Validation on arguments being a big number from bn.js
 * Throws if an argument is not in BN format or otherwise invalid
 * @param argMap
 */
function validateBNLike(argMap: { [name: string]: any }) {
    const bnLike = 'number, decimal string or BN';
    for (const argName of Object.keys(argMap)) {
        const argValue = argMap[argName];
        if (argValue && !BN.isBN(argValue) && isNaN(argValue)) {
            throw new ArgumentTypeError(argName, bnLike, argValue);
        }
    }
}
