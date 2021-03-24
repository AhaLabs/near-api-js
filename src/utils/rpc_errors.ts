
import Mustache from 'mustache';
import schema from '../generated/rpc_error_schema.json';
import messages from '../res/error_messages.json';
import { TypedError } from './errors';
import { ExecutionOutcomeWithIdView } from '../providers/provider';

export class ServerError extends TypedError {
    context?: ServerErrorContext;
    constructor(message: string, type: string, context?: ServerErrorContext) {
        super(message, type);
        this.context = context;
    }

    isSubtypeOf(errorType: string) {
        return this.context && this.context.errorPath &&
            JSON.stringify(this.context.errorPath).includes(errorType);
    }
}

export class ServerErrorContext {
    transactionHash?: string;
    errorPath?: Record<string, any>;
    constructor(transactionHash?: string, errorPath?: Record<string, any>) {
        this.transactionHash = transactionHash;
        this.errorPath = errorPath;
    }
}

export class ServerTransactionError extends ServerError {
    public transaction_outcome: ExecutionOutcomeWithIdView; //TODO: should it be a part of context?
}

export function parseRpcError(errorObj: Record<string, any>): ServerError {
    const result = {};
    const errorClassName = walkSubtype(errorObj, schema.schema, result, '');
    const error = new ServerError(
        formatError(errorClassName, result),
        errorClassName,
        new ServerErrorContext(undefined, errorObj));
    Object.assign(error, result);
    return error;
}

export function parseRpcResultError(result: any): ServerTransactionError {
    const server_error = parseRpcError(result.status.Failure);
    const server_tx_error = new ServerTransactionError(server_error.message, server_error.type);
    Object.assign(server_tx_error, server_error);
    server_tx_error.transaction_outcome = result.transaction_outcome;
    return server_tx_error;
}

export function formatError(errorClassName: string, errorData): string {
    if (typeof messages[errorClassName] === 'string') {
        return Mustache.render(messages[errorClassName], errorData);
    }
    return JSON.stringify(errorData);
}

/**
 * Walks through defined schema returning error(s) recursively
 * @param errorObj The error to be parsed
 * @param schema A defined schema in JSON mapping to the RPC errors
 * @param result An object used in recursion or called directly
 * @param typeName The human-readable error type name as defined in the JSON mapping
 */
function walkSubtype(errorObj, schema, result, typeName) {
    let error;
    let type;
    let errorTypeName;
    for (const errorName in schema) {
        if (isString(errorObj[errorName])) {
            // Return early if error type is in a schema
            return errorObj[errorName];
        }
        if (isObject(errorObj[errorName])) {
            error = errorObj[errorName];
            type = schema[errorName];
            errorTypeName = errorName;
        } else if (isObject(errorObj.kind) && isObject(errorObj.kind[errorName])) {
            error = errorObj.kind[errorName];
            type = schema[errorName];
            errorTypeName = errorName;
        } else {
            continue;
        }
    }
    if (error && type) {
        for (const prop of Object.keys(type.props)) {
            result[prop] = error[prop];
        }
        return walkSubtype(error, schema, result, errorTypeName);
    } else {
        // TODO: is this the right thing to do?
        result.kind = errorObj;
        return typeName;
    }
}

export function getErrorTypeFromErrorMessage(errorMessage) {
    // This function should be removed when JSON RPC starts returning typed errors.
    switch (true) {
    case /^account .*? does not exist while viewing$/.test(errorMessage):
        return 'AccountDoesNotExist';
    case /^Account .*? doesn't exist$/.test(errorMessage):
        return 'AccountDoesNotExist';
    case /^access key .*? does not exist while viewing$/.test(errorMessage):
        return 'AccessKeyDoesNotExist';
    case /wasm execution failed with error: FunctionCallError\(CompilationError\(CodeDoesNotExist/.test(errorMessage):
        return 'CodeDoesNotExist';
    case /Transaction nonce \d+ must be larger than nonce of the used access key \d+/.test(errorMessage):
        return 'InvalidNonce';
    default:
        return 'UntypedError';
    }
}

/**
 * Helper function determining if the argument is an object
 * @param n Value to check
 */
function isObject(n) {
    return Object.prototype.toString.call(n) === '[object Object]';
}

/**
 * Helper function determining if the argument is a string
 * @param n Value to check
 */
function isString(n) {
    return Object.prototype.toString.call(n) === '[object String]';
}
