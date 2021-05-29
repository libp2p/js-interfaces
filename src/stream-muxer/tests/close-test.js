// @ts-nocheck interface tests
/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const chai = require('chai')
const expect = chai.expect
chai.use(require('dirty-chai'))

const pair = require('it-pair/duplex')
const { pipe } = require('it-pipe')
const { consume } = require('streaming-iterables')
const { source: abortable } = require('abortable-iterator')
const AbortController = require('abort-controller').default
const uint8arrayFromString = require('uint8arrays/from-string')

function pause (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function randomBuffer () {
  return uint8arrayFromString(Math.random().toString())
}

const infiniteRandom = {
  [Symbol.asyncIterator]: async function * () {
    while (true) {
      yield randomBuffer()
      await pause(10)
    }
  }
}

module.exports = (common) => {
  describe('close', () => {
    let Muxer

    beforeEach(async () => {
      Muxer = await common.setup()
    })

    it('closing underlying socket closes streams', async () => {
      const mockConn = muxer => ({
        newStream: (...args) => muxer.newStream(...args)
      })

      const mockUpgrade = maConn => {
        const muxer = new Muxer(stream => pipe(stream, stream))
        pipe(maConn, muxer, maConn)
        return mockConn(muxer)
      }

      const [local, remote] = pair()
      const controller = new AbortController()
      const abortableRemote = abortable.duplex(remote, controller.signal, {
        returnOnAbort: true
      })

      mockUpgrade(abortableRemote)
      const dialerConn = mockUpgrade(local)

      const s1 = await dialerConn.newStream()
      const s2 = await dialerConn.newStream()

      // close the remote in a bit
      setTimeout(() => controller.abort(), 50)

      const s1Result = pipe(infiniteRandom, s1, consume)
      const s2Result = pipe(infiniteRandom, s2, consume)

      // test is complete when all muxed streams have closed
      await s1Result
      await s2Result
    })

    it('closing one of the muxed streams doesn\'t close others', async () => {
      const p = pair()
      const dialer = new Muxer()

      // Listener is echo server :)
      const listener = new Muxer(stream => pipe(stream, stream))

      pipe(p[0], dialer, p[0])
      pipe(p[1], listener, p[1])

      const stream = dialer.newStream()
      const streams = Array.from(Array(5), () => dialer.newStream())
      let closed = false
      const controllers = []

      const streamResults = streams.map(async stream => {
        const controller = new AbortController()
        controllers.push(controller)

        try {
          const abortableRand = abortable(infiniteRandom, controller.signal, { abortCode: 'ERR_TEST_ABORT' })
          await pipe(abortableRand, stream, consume)
        } catch (err) {
          if (err.code !== 'ERR_TEST_ABORT') throw err
        }

        if (!closed) throw new Error('stream should not have ended yet!')
      })

      // Pause, and then send some data and close the first stream
      await pause(50)
      await pipe([randomBuffer()], stream, consume)
      closed = true

      // Abort all the other streams later
      await pause(50)
      controllers.forEach(c => c.abort())

      // These should now all resolve without error
      await Promise.all(streamResults)
    })

    it('can close a stream for writing', (done) => {
      const p = pair()
      const dialer = new Muxer()
      const data = [randomBuffer(), randomBuffer()]

      const listener = new Muxer(async stream => {
        // Immediate close for write
        await stream.closeWrite()

        const results = await pipe(stream, async (source) => {
          const data = []
          for await (const chunk of source) {
            data.push(chunk.slice())
          }
          return data
        })
        expect(results).to.eql(data)

        try {
          await stream.sink([randomBuffer()])
        } catch (err) {
          expect(err).to.exist()
          return done()
        }
        expect.fail('should not support writing to closed writer')
      })

      pipe(p[0], dialer, p[0])
      pipe(p[1], listener, p[1])

      const stream = dialer.newStream()
      stream.sink(data)
    })

    it('can close a stream for reading', (done) => {
      const p = pair()
      const dialer = new Muxer()
      const data = [randomBuffer(), randomBuffer()]

      const listener = new Muxer(async stream => {
        const results = await pipe(stream, async (source) => {
          const data = []
          for await (const chunk of source) {
            data.push(chunk.slice())
          }
          return data
        })
        expect(results).to.eql(data)
        done()
      })

      pipe(p[0], dialer, p[0])
      pipe(p[1], listener, p[1])

      const stream = dialer.newStream()
      stream.closeRead()

      // Source should be done
      ;(async () => {
        expect(await stream.source.next()).to.eql({ done: true })
        stream.sink(data)
      })()
    })
  })
}
