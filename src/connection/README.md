interface-connection
==================

This is a test suite and interface you can implement to provide libp2p compatible connection.

Publishing typescript interface lets multiple implementations to claim compatibility via `@implements {Connection}` directive and utilize typescript to ensure compatibility.

Publishing a test suite as a module lets multiple modules ensure compatibility since they use the same test suite.

## Usage

### Connection

Before creating a connection from a transport compatible with `libp2p` it is important to understand some concepts:

- **socket**: the underlying raw duplex connection between two nodes. It is created by the transports during a dial/listen.
- **[multiaddr connection](https://github.com/libp2p/interface-transport#multiaddrconnection)**: an abstraction over the socket to allow it to work with multiaddr addresses. It is a duplex connection that transports create to wrap the socket before passing to an upgrader that turns it into a standard connection (see below).
- **connection**: a connection between two _peers_ that has built in multiplexing and info about the connected peer. It is created from a [multiaddr connection](https://github.com/libp2p/interface-transport#multiaddrconnection) by an upgrader. The upgrader uses multistream-select to add secio and multiplexing and returns this object.
- **stream**: a muxed duplex channel of the `connection`. Each connection may have many streams.

A connection stands for the libp2p communication duplex layer between two nodes. It is **not** the underlying raw transport duplex layer (socket), such as a TCP socket, but an abstracted layer that sits on top of the raw socket.

This helps ensuring that the transport is responsible for socket management, while also allowing the application layer to handle the connection management.

### Test suite

```js
const tests = require('libp2p-interfaces/src/connection/tests')
describe('your connection', () => {
  tests({
    // Options should be passed to your connection
    async setup (options) {
      return YourConnection
    },
    async teardown () {
      // cleanup resources created by setup()
    }
  })
})
```


