import type { PeerId } from '../peer-id/types.js'
import type { MultiaddrConnection } from '../transport/types.js'

/**
 * A libp2p crypto module must be compliant to this interface
 * to ensure all exchanged data between two peers is encrypted.
 */
export interface Crypto<Protocol extends string = string> {
  protocol: Protocol
  /**
   * Encrypt outgoing data to the remote party.
   */
  secureOutbound: (localPeer: PeerId, connection: MultiaddrConnection, remotePeer: PeerId) => Promise<SecureOutbound>
  /**
   * Decrypt incoming data.
   */
  secureInbound: (localPeer: PeerId, connection: MultiaddrConnection, remotePeer?: PeerId) => Promise<SecureOutbound>
}

export interface SecureOutbound {
  conn: MultiaddrConnection
  // TODO(@vasco-santos): Can this be Uint8Array instead ?
  remoteEarlyData: Buffer
  remotePeer: PeerId
}

export interface Cipher {
  encrypt: (data: Uint8Array) => Promise<Uint8Array>
  decrypt: (data: Uint8Array) => Promise<Uint8Array>
}

export interface Hasher {
  /**
   * Takes binary `input` and returns it's hash digest.
   *
   * @param {Uint8Array} input
   */
  digest: (data: Uint8Array) => Promise<Uint8Array>

  length: number
}

export interface PublicKey<Algorithm extends string = string> {
  /**
   * Binary reprerestation of this public key which encodes key type and
   * the key itself.
   */
  readonly bytes: Uint8Array

  /**
   * Cryptographic algorithm
   */
  algorithm: Algorithm

  /**
   * Raw bytes of this key.
   */
  marshal: () => Uint8Array

  /**
   * Verifies that data was signed by the corresponding private key.
   */
  verify: (data: Uint8Array, signature: Uint8Array) => Promise<boolean>

  equals: (key: PublicKey) => key is this

  /**
   * Hash of this key.
   */
  hash: () => Promise<Uint8Array>
}

export interface EncryptionKey {
  encrypt: (data: Uint8Array) => Uint8Array
}

export interface PrivateKey<Algorithm extends string = string> {
  readonly algorithm: Algorithm
  readonly public: PublicKey<Algorithm>
  readonly bytes: Uint8Array
  sign: (data: Uint8Array) => Promise<Uint8Array>
  marshal: () => Uint8Array
  equals: (key: PrivateKey) => key is this
  hash: () => Promise<Uint8Array>

  /**
   * Unique id of this key.
   */
  id: () => Promise<string>

  /**
   * @deprecated - See https://github.com/libp2p/js-libp2p-crypto/issues/190
   */
  export: (password: string, format?: 'pkcs-8'|'libp2p-key') => Promise<string>
}

export interface DecryptionKey {
  decrypt: (bytes: Uint8Array) => Uint8Array
}

export interface Keystretcher {
  iv: Uint8Array
  cipherKey: Uint8Array
  macKey: Uint8Array
}

export interface StretchPair {
  k1: Keystretcher
  k2: Keystretcher
}
