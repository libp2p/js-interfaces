import type { PeerId } from '../peer-id/types.js'
import type { Connection } from '../connection/types.js'

export interface Options {
  /**
   * Minimum needed connections. If omited defaults to `0`.
   */
  min?: number
  /**
   * Maximum needed connections. If omited default to `Infinity`.
   */
  max?: number

  handlers?: Handler[]
}

export interface Handler {
  /**
   * Protocol "onConnect" handler.
   */
  onConnect?: (peerId: PeerId, conn: Connection) => void
  /**
   * Protocol "onDisconnect" handler.
   */
  onDisconnect?: (peerId: PeerId, error?: Error) => void
}

export interface Topology<Registrar extends unknown = unknown> {
  min: number
  max: number
  peers: Set<string>

  [Symbol.toStringTag]: 'Topology'

  // TODO(@vasco-santos) Does this need to be part of the interface
  // or is that just implementation detail ? If it should be we should probably
  // entype it.
  registrar: Registrar

  /**
   * Notify about peer disconnected event.
   *
   * @param {PeerId} id
   */
  disconnect: (id: PeerId) => void
}
