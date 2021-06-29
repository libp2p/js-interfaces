import type { EventEmitter } from 'events'
import type { MuxedStream } from '../stream-muxer/types.js'
import type { PeerId } from '../peer-id/types.js'

export interface InMessage {
  from?: string
  receivedFrom: string
  topicIDs: string[]
  seqno: Uint8Array
  data: Uint8Array
  signature?: Uint8Array
  key?: Uint8Array
}

/**
 * Topic validators are function
 */
export interface TopiValidator {
  (topic: string, message: InMessage): Promise<void>
}

export interface PubsubProtocol<Registrar extends unknown = unknown> extends EventEmitter {
  readonly multicodecs: string[]

  // TODO(@vasco-santos): Does this need to be part of the interface or can this
  // an implementation detail ?
  registrar: Registrar

  // TODO(@vasco-santos): Can we leave this out ?
  readonly peerId: PeerId

  /**
   * Map of topics to which peers are subscribed to
   */
  // TODO(@vasco-santos): Can we leave this out ? Seems like implementation
  // detail of getTopics.
  topics: Map<string, Set<string>>

  /**
   * List of subscriptions
   */
  // TODO(@vasco-santos): Can we leave this out ?
  subscriptions: Set<string>

  /**
   * Map of peer streams
   */
  // TODO(@vasco-santos): Can we leave this out ?
  peers: Map<string, PeerStreams>

  /**
   * The signature policy to follow by default
   */
  // TODO(@vasco-santos): Can we leave this out ?
  globalSignaturePolicy: string

  /**
   * If router can relay received messages, even if not subscribed
   */
  // TODO(@vasco-santos): Can we leave this out ?

  readonly canRelayMessage: boolean

  /**
   * If publish should emit to self, if subscribed
   */
  // TODO(@vasco-santos): Can we leave this out ?
  readonly emitSelf: boolean

  /**
   * Topic validator map keyed by topic.
   */
  // TODO(@vasco-santos): Can we leave this out ?
  topicValidators: Map<string, TopiValidator>

  /**
   * Register the pubsub protocol onto the libp2p node.
   */
  start: () => void

  /**
   * Unregister the pubsub protocol and the streams with other peers will be
   * closed.
   */
  stop: () => void

  /**
   * Derives message id (in binary representation) from the message.
   *
   * @param {InMessage} message - The message object
   */
  getMsgId: (message: InMessage) => Uint8Array

  /**
   * Validates the given message. The signature will be checked for authenticity.
   * Promise will fail if message is invalid.
   */
  validate: (message: InMessage) => Promise<void>

  /**
   * Get a list of the peer-ids that are subscribed to one topic.
   */
  getSubscribers: (topic: string) => string[]

  /**
   * Get the list of topics which the peer is subscribed to.
   */
  getTopics: () => string[]

  /**
   * Publishes messages to all subscribed peers
   */
  publish: (topic: string, message: Uint8Array) => Promise<void>

  /**
   * Subscribes to a given topic.
   */
  subscribe: (topic: string) => void
  /**
   * Unsubscribe from the given topic.
   */
  unsubscribe: (topic: string) => void
}

/**
 * Thin wrapper around a peer's inbound / outbound pubsub streams
 */

export interface PeerStreams<Protocol extends string = string> extends EventEmitter {
  readonly id: PeerId
  readonly protocol: Protocol

  /**
   * Do we have a connection to read from?
   */
  readonly isReadable: boolean
  /**
   * Do we have a connection to write on?
   */
  readonly isWritable: boolean

  /**
   * Send a message to this peer. Throws when `isWritable` is false.
   */
  write: (data: Uint8Array) => void

  /**
   * Closes the open connection to peer
   */
  close: () => void

  /**
   * Attach a raw inbound stream and setup a read stream
   */
  attachInboundStream: (stream: MuxedStream) => AsyncIterable<Uint8Array>

  /**
   * Attach a raw outbound stream and setup a write stream
   */
  attachOutboundStream: (stream: MuxedStream) => Promise<void>
}

/**
 * Details how message signatures are produced/consumed
 */

export type SignaturePolicy =
  | StrictSignPolicy
  | StrictNoSignPolicy

/**
 * On the producing side:
 * * Build messages with the signature, key (from may be enough for certain inlineable public key types), from and seqno fields.
 *
 * On the consuming side:
 * * Enforce the fields to be present, reject otherwise.
 * * Propagate only if the fields are valid and signature can be verified, reject otherwise.
 */
export type StrictSignPolicy = 'StrictSign'

/**
 * On the producing side:
 * * Build messages without the signature, key, from and seqno fields.
 * * The corresponding protobuf key-value pairs are absent from the marshalled message, not just empty.
 *
 * On the consuming side:
 * * Enforce the fields to be absent, reject otherwise.
 * * Propagate only if the fields are absent, reject otherwise.
 * * A message_id function will not be able to use the above fields, and should instead rely on the data field. A commonplace strategy is to calculate a hash.
 */
export type StrictNoSignPolicy = 'StrictNoSign'
