var choppa = require('choppa')
var headerStream = require('.')
var test = require('tape')
var stream = require('stream')
var through = require('through2')

test('Sample', function (assert) {
  var data = Buffer.allocUnsafe(16)

  var a = headerStream(15, function (header, swap) {
    assert.ok(Buffer.compare(header, data.slice(0, 15)) === 0)

    swap(null, headerStream(1, function (piece, swap) {
      assert.ok(Buffer.compare(piece, data.slice(15)) === 0)

      swap(null, null)
    }))
  })

  a.on('error', assert.error)
  a.on('end', assert.end)
  a.on('data', assert.fail)

  var source = choppa(3)
  source.pipe(a)
  source.write(data)
  source.end()
})

test('Too short', function (assert) {
  var data = Buffer.allocUnsafe(8)

  var a = headerStream(15, function (header, swap) {
    assert.ok(header.length < 15)
    assert.ok(Buffer.compare(header, data) === 0)

    swap(null, null)
  })

  a.on('error', assert.error)
  a.on('end', assert.end)
  a.on('data', assert.fail)

  var source = choppa(3)
  source.pipe(a)
  source.write(data)
  source.end()
})

test('Rewrite header', function (assert) {
  var data = Buffer.allocUnsafe(16)

  var a = headerStream(15, function (header, swap) {
    assert.ok(Buffer.compare(header, data.slice(0, 15)) === 0)
    b.write(header)
    swap(null, b)
  })

  var b = headerStream(16, function (piece, swap) {
    assert.ok(Buffer.compare(piece, data) === 0)

    swap(null, null)
  })

  b.on('error', assert.error)
  b.on('end', assert.end)
  b.on('data', assert.fail)

  var source = choppa(3)
  source.pipe(a)
  source.write(Buffer.from([]))
  source.write(data)
  source.end()
})

test('Set stream async', function (assert) {
  var data = Buffer.allocUnsafe(16)

  var a = headerStream(8, function (header, swap) {
    assert.ok(Buffer.compare(header, data.slice(0, 8)) === 0)

    process.nextTick(function () {
      b.write(header)
      swap(null, b)
    })
  })

  var b = headerStream(16, function (piece, swap) {
    assert.ok(Buffer.compare(piece, data) === 0)

    swap(null, null)
  })

  b.on('error', assert.error)
  b.on('end', assert.end)
  b.on('data', assert.fail)

  var source = choppa(3)
  source.pipe(a)
  source.write(Buffer.from([]))
  source.write(data)
  source.end()
})
