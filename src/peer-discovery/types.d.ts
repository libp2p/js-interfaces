import type { EventEmitter } from 'events'

export interface PeerDiscoveryFactory {
  new (options?: any): PeerDiscovery
  tag: string
}

export interface PeerDiscovery extends EventEmitter {
  start: () => void|Promise<void>
  stop: () => void|Promise<void>
}

export default PeerDiscovery
