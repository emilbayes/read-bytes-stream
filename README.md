# `read-bytes-stream`

> Read `n` bytes of a stream, then swap to another stream

## Usage

```js
var readBytes = require('read-bytes-stream')
var xsalsaStream = require('...')

var nonce = Buffer.alloc(32)
var key = Buffer.from('my secret key')

var streamCipher = readBytes(32, function (bytes, swap) {
  if (bytes.length < 32) return swap(new Error('Too few bytes'))

  nonce.set(bytes)

  swap(null, xsalsaStream(nonce, key))
})

```

## API

### `var stream = readBytes(n, onchunk)`

Will read `n` bytes, unless the source stream ends prematurely.
`onchunck(bytes, swap)` will be called with as many bytes as was read,
but at most `n`, and a callback to either return an `Error` or swap to another
stream. You can optionally re-write the received bytes to the new stream which
effectively turns this module into [`peek-stream`](https://github.com/mafintosh/peek-stream)

## Install

```sh
npm install read-bytes-stream
```

## License

[ISC](LICENSE.md)
