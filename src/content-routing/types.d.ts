import type { PeerId } from '../peer-id/types.js'
import type { Multiaddr } from '../multiaddr/types.js'
// TODO: Import interface instead
import CID from 'cids'

export interface ContentRoutingFactory {
  new (options?: any): ContentRouting
}

export interface ContentRouting {
  provide: (cid: CID) => Promise<void>
  findProviders: (cid: CID, options: Object) => AsyncIterable<{ id: PeerId, multiaddrs: Multiaddr[] }>
}

export default ContentRouting
