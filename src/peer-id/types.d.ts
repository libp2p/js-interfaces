
import type { PublicKey } from '../crypto/types.js'

export interface JSONPeerId {
  /**
   * String representation of PeerId.
   */
  id: string
  /**
   * Public key.
   */
  pubKey?: string
  // /**
  //  * Private key.
  //  */
  // privKey?: string
}
export interface PeerId {
  /**
   * Binary representation of the peer id.
   */
  readonly id: Uint8Array

  // readonly privKey: PrivateKey | null
  readonly pubKey: PublicKey

  marshal: (excludePriv?: boolean) => Uint8Array
  toPrint: () => string
  toJSON: () => JSONPeerId

  /**
   * Return raw id bytes.
   */
  toBytes: () => Uint8Array

  toString: () => string
  toB58String: () => string

  equals: (other: PeerId | Uint8Array) => boolean
}
