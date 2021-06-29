
import type { MuxedStream } from '../stream-muxer/types.js'
export interface StreamData {
  /**
   * the protocol used by the stream
   */
  protocol: string
  /**
   * metadata of the stream
   */
  metadata?: object
}

export type ConnectionStatus =
  | 'open'
  | 'closing'
  | 'closed'

export type ConnectionDirection =
  | 'inbound'
  | 'outbound'

export interface ConnectionStat {
  readonly status: ConnectionStatus
  /**
   * connection establishment direction
   */
  readonly direction: ConnectionDirection
  /**
   * connection relevant events timestamp.
   */
  readonly timeline: Timeline

  /**
   * connection multiplexing identifier
   */
  readonly multiplexer?: string

  /**
   * connection encryption method identifier
   */
  readonly encryption?: string
}

export interface Timeline {
  /**
   * connection opening timestamp.
   */
  open: number
  /**
   * connection upgraded timestamp.
   */
  upgraded?: number

  close?: number
}

/**
 * An implementation of the js-libp2p connection.
 * Any libp2p transport should use an upgrader to return this connection.
 */
export interface Connection {
  /**
   * Connection identifier.
   */
  readonly id: string
  /**
   * Observed multiaddr of the local peer
   */
  readonly localAddr: Multiaddr | null | undefined
  /**
   * Observed multiaddr of the remote peer
   */
  readonly remoteAddr: Multiaddr

  /**
   * Local peer id.
   */
  readonly localPeer: PeerId

  /**
   * Remote peer id.
   */
  readonly remotePeer: PeerId

  readonly tags: string[]

  readonly [Symbol.toStringTag]: 'Connection'

  readonly stat: ConnectionStat

  readonly streams: MuxedStream[]

  /**
   * Create a new stream from this connection
   */
  newStream: (protocols: string|string[]) => Promise<{stream: MuxedStream, protocol: string}>

  /**
   * Add a stream when it is opened to the registry.
   *
   * @param muxedStream - a muxed stream
   * @param data - the stream data to be registered
   */
  addStream: (muxedStream: MuxedStream, data: StreamData) => void

  /**
   * Remove stream registry after it is closed.
   *
   * @param id - identifier of the stream
   */
  removeStream: (id: string) => void

  /**
   * Close the connection.
   */
  close: () => Promise<void>
}
