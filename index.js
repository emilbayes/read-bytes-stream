var assert = require('nanoassert')
var duplexify = require('duplexify')
var through = require('through2')

module.exports = function (bytes, onchunck) {
  assert(typeof bytes === 'number', 'bytes must be number')
  assert(bytes > 0, 'bytes must be positive, non-zero integer')
  assert(Number.isSafeInteger(bytes), 'bytes must be safe integer')
  assert(typeof onchunck === 'function', 'onchunck must be function')

  var buffer = Buffer.alloc(bytes)
  var idx = 0

  var fillChunk = through(function (data, enc, next) {
    var piece = data.slice(0, bytes - idx)
    buffer.set(piece, idx)
    idx += piece.length

    if (idx < bytes) return next()
    ready(buffer, data.slice(piece.length), next)
  })

  var dup = duplexify()

  dup.on('preend', onpreend)
  dup.setWritable(fillChunk)

  return dup

  function onpreend () {
    ready(buffer, null, function (err) {
      if (err) return dup.destroy(err)
    })
  }

  function ready(header, overflow, done) {
    dup.cork()
    dup.removeListener('preend', onpreend)

    onchunck(header.slice(0, idx), function (err, stream) {
      if (err) return done(err)

      if (overflow && overflow.length > 0) stream.write(overflow)

      dup.setWritable(stream)
      dup.setReadable(stream)

      overflow = data = buffer = fillChunk = null // free the data

      dup.uncork()
      done()
    })
  }
}
