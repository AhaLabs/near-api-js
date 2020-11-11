import { Signature, KeyPair, PublicKey } from './utils/key_pair';
import { KeyStore } from './key_stores';
/**
 * General signing interface, can be used for in memory signing, RPC singing, external wallet, HSM, etc.
 */
export declare abstract class Signer {
    /**
     * Creates new key and returns public key.
     */
    abstract createKey(accountId: string, networkId?: string): Promise<PublicKey>;
    /**
     * Creates a public key for the account, network and keyPair provided
     * @param networkId The targeted network. (ex. default, betanet, etc…)
     * @param accountId accountId to retrieve from.
     * @param keyPair The keyPair to use for signing
     */
    abstract fromKeyPair(networkId: string, accountId: string, keyPair: KeyPair): Promise<PublicKey>;
    /**
     * Returns public key for given account / network.
     * @param accountId accountId to retrieve from.
     * @param networkId The targeted network. (ex. default, betanet, etc…)
     */
    abstract getPublicKey(accountId?: string, networkId?: string): Promise<PublicKey>;
    /**
     * Signs given message, by first hashing with sha256.
     * @param message message to sign.
     * @param accountId accountId to use for signing.
     * @param networkId The targeted network. (ex. default, betanet, etc…)
     */
    abstract signMessage(message: Uint8Array, accountId?: string, networkId?: string): Promise<Signature>;
}
/**
 * Signs using in memory key store.
 */
export declare class InMemorySigner extends Signer {
    readonly keyStore: KeyStore;
    constructor(keyStore: KeyStore);
    /**
     * Creates a public key for the account given
     * @param accountId The NEAR account to assign a public key to
     * @param networkId The targeted network. (ex. default, betanet, etc…)
     * @returns {Promise<PublicKey>}
     */
    createKey(accountId: string, networkId: string): Promise<PublicKey>;
    /**
     * Creates a public key for the account, network and keyPair provided
     * @param networkId The targeted network. (ex. default, betanet, etc…)
     * @param accountId The NEAR account to assign a public key to
     * @param keyPair The keyPair to use for signing
     * @returns {Promise<PublicKey>}
     */
    fromKeyPair(networkId: string, accountId: string, keyPair: KeyPair): Promise<PublicKey>;
    /**
     * Gets the existing public key for a given account
     * @param accountId The NEAR account to assign a public key to
     * @param networkId The targeted network. (ex. default, betanet, etc…)
     * @returns {Promise<PublicKey>} Returns the public key or null if not found
     */
    getPublicKey(accountId?: string, networkId?: string): Promise<PublicKey>;
    /**
     * @param message A message to be signed, typically a serialized transaction
     * @param accountId the NEAR account signing the message
     * @param networkId The targeted network. (ex. default, betanet, etc…)
     * @returns {Promise<Signature>}
     */
    signMessage(message: Uint8Array, accountId?: string, networkId?: string): Promise<Signature>;
    toString(): string;
}
