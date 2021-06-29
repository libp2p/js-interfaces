import type { PeerId } from '../peer-id/types.js'
import type { Multiaddr } from '../multiaddr/types.js'

export interface PeerRoutingFactory {
  new (options?: any): PeerRouting
}

export interface PeerRouting<
  FindPeerOptions extends Object = unknown,
  GetClosestPeersOptions extends Object = unknown> {
  findPeer: (peerId: PeerId, options?: FindPeerOptions) => Promise<{ id: PeerId, multiaddrs: Multiaddr[] }>
  getClosestPeers: (key: Uint8Array, options?: GetClosestPeersOptions) => AsyncIterable<{ id: PeerId, multiaddrs: Multiaddr[] }>
}

export default PeerRouting
