// We difine type here as we do not want to introduce
// dependency on the BufferList class but rather we want
// anything that implementsn it's API.

import type BL from 'bl'
export type BufferList = {
  [K in keyof BL]: BL[K]
}

export interface MuxerFactory {
  new (options: MuxerOptions): Muxer
  multicodec: string
}

/**
 * A libp2p stream muxer
 */
export interface Muxer {
  readonly streams: MuxedStream[]
  /**
   * Initiate a new stream with the given name. If no name is
   * provided, the id of th stream will be used.
   */
  newStream: (name?: string) => MuxedStream

  /**
   * A function called when receiving a new stream from the remote.
   */
  onStream: (stream: MuxedStream) => void

  /**
   * A function called when a stream ends.
   */
  onStreamEnd: (stream: MuxedStream) => void
}

export interface MuxerOptions {
  onStream: (stream: MuxedStream) => void
  onStreamEnd: (stream: MuxedStream) => void
  maxMsgSize?: number
}

export interface MuxedTimeline {
  open: number
  close?: number
}

export interface MuxedStream extends AsyncIterable<Uint8Array | BufferList> {
  close: () => void
  abort: () => void
  reset: () => void
  sink: Sink
  source: AsyncIterable<Uint8Array | BufferList>
  timeline: MuxedTimeline
  id: string
}

export interface Sink { (source: Uint8Array): Promise<void> }
