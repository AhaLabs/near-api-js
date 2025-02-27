/** @hidden @module */
import * as providers from './providers';
import * as utils from './utils';
import * as transactions from './transaction';
import * as validators from './validators';

import { Account, ViewFunctionOptions } from './account';
import * as multisig from './account_multisig';
import * as accountCreator from './account_creator';
import { Connection } from './connection';
import { Signer, InMemorySigner } from './signer';
import { Contract, ChangeMethodOptions,  } from './contract';
import { KeyPair } from './utils/key_pair';
import { Near } from './near';

// TODO: Deprecate and remove WalletAccount
import {
    ConnectedWalletAccount,
    WalletAccount,
    WalletConnection
} from './wallet-account';

export {
    accountCreator,
    providers,
    utils,
    transactions,
    validators,

    multisig,
    Account,
    ViewFunctionOptions,
    Connection,
    Contract,
    ChangeMethodOptions,
    InMemorySigner,
    Signer,
    KeyPair,

    Near,

    ConnectedWalletAccount,
    WalletAccount,
    WalletConnection
};
