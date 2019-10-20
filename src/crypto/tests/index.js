/* eslint-env mocha */
'use strict'

const duplexPair = require('it-pair/duplex')
const pipe = require('it-pipe')
const peers = require('../../utils/peers')
const PeerId = require('peer-id')
const { collect } = require('streaming-iterables')
const chai = require('chai')
const expect = chai.expect
chai.use(require('dirty-chai'))

module.exports = (common) => {
  describe('interface-crypto', () => {
    let crypto
    let localPeer
    let remotePeer

    before(async () => {
      [
        crypto,
        localPeer,
        remotePeer
      ] = await Promise.all([
        common.setup(),
        PeerId.createFromJSON(peers[0]),
        PeerId.createFromJSON(peers[1])
      ])
    })

    after(() => common.teardown && common.teardown())

    it('has a protocol string', () => {
      expect(crypto.protocol).to.exist()
      expect(crypto.protocol).to.be.a('string')
    })

    it('it wraps the provided duplex connection', async () => {
      const [localConn, remoteConn] = duplexPair()

      const [
        inboundResult,
        outboundResult
      ] = await Promise.all([
        crypto.secureInbound(remotePeer, localConn),
        crypto.secureOutbound(localPeer, remoteConn, remotePeer)
      ])

      // Echo server
      pipe(inboundResult.conn, inboundResult.conn)

      // Send some data and collect the result
      const input = Buffer.from('data to encrypt')
      const result = await pipe(
        [input],
        outboundResult.conn,
        // Convert BufferList to Buffer via slice
        (source) => (async function * toBuffer () {
          for await (const chunk of source) {
            yield chunk.slice()
          }
        })(),
        collect
      )

      expect(result).to.eql([input])
    })

    it('should return the remote peer id', async () => {
      const [localConn, remoteConn] = duplexPair()

      const [
        inboundResult,
        outboundResult
      ] = await Promise.all([
        crypto.secureInbound(remotePeer, localConn),
        crypto.secureOutbound(localPeer, remoteConn, remotePeer)
      ])

      // Inbound should return the initiator (local) peer
      expect(inboundResult.remotePeer.id).to.eql(localPeer.id)
      // Outbound should return the receiver (remote) peer
      expect(outboundResult.remotePeer.id).to.eql(remotePeer.id)
    })
  })
}
