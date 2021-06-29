import type { BufferList, Sink } from '../stream-muxer/types.js'
import type { EventEmitter } from 'events'
import type { Multiaddr } from '../multiaddr/types.js'
import type { Connection } from '../connection/connection.js'

export interface TransportFactory<DialOptions extends { signal?: AbortSignal }, ListenerOptions> {
  new(upgrader: Upgrader): Transport<DialOptions, ListenerOptions>
}

/**
 * A libp2p transport is understood as something that offers a dial and listen interface to establish connections.
 */
export interface Transport <DialOptions extends { signal?: AbortSignal }, ListenerOptions> {
  /**
   * Dial a given multiaddr.
   */
  dial: (ma: Multiaddr, options?: DialOptions) => Promise<Connection>
  /**
   * Create transport listeners.
   */
  createListener: (options: ListenerOptions, handler?: (connection: Connection) => void) => Listener
  /**
   * Takes a list of `Multiaddr`s and returns only valid addresses for the transport
   */
  filter: (multiaddrs: Multiaddr[]) => Multiaddr[]
}

export interface Listener extends EventEmitter {
  /**
   * Start a listener
   */
  listen: (multiaddr: Multiaddr) => Promise<void>
  /**
   * Get listen addresses
   */
  getAddrs: () => Multiaddr[]
  /**
   * Close listener
   *
   * @returns {Promise<void>}
   */
  close: () => Promise<void>
}

export interface Upgrader {
  /**
   * Upgrades an outbound connection on `transport.dial`.
   */
  upgradeOutbound: (maConn: MultiaddrConnection) => Promise<Connection>

  /**
   * Upgrades an inbound connection on transport listener.
   */
  upgradeInbound: (maConn: MultiaddrConnection) => Promise<Connection>
}

export interface MultiaddrConnectionTimeline {
  open: number
  upgraded?: number
  close?: number
}

export interface MultiaddrConnection {
  sink: Sink
  source: AsyncIterable<Uint8Array | BufferList>
  close: (err?: Error) => Promise<void>
  conn: unknown
  remoteAddr: Multiaddr
  localAddr?: Multiaddr
  timeline: MultiaddrConnectionTimeline
}
