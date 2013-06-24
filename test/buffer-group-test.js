var test = require('tap').test,
    OffsetBuffer = require('offset-buffer'),
    BufferGroup = require('../buffer-group.js')(OffsetBuffer, console);

process.on('uncaughtException', function(err) {
    console.log('Uncaught exception: ' + err);
    process.exit(-1);
});

test('push()', function(t) {
    t.test('One buffer', function(t) {
        var group = new BufferGroup();

        t.equal(group.length, 0, 'An empty GroupBuffer should have a 0 length');
        group.push(new Buffer(3));
        t.equal(group.length, 3, 'Total GroupBuffer length should equal the total length of the buffers (one buffer)');
        t.equal(group.group.length, 1, 'GroupBuffer array should have the the exact number of buffers as entered (one buffer)');
        t.end();
    });
    t.test('Multiple buffers', function(t) {
        var group = new BufferGroup();
        group.push(new Buffer(3));
        group.push(new Buffer(4));
        group.push(new Buffer(5));
        t.equal(group.length, 12, 'Total GroupBuffer length should equal the total length of the buffers (multiple buffers)');
        t.equal(group.group.length, 3, 'GroupBuffer array should have the the exact number of buffers as entered (multiple buffers)');
        t.end();
    });
    t.end();
});

test('clear()', function(t) {
    var group = new BufferGroup();
    group.push(new Buffer(3));
    group.push(new Buffer(4));
    group.push(new Buffer(5));
    group.clear();
    t.equal(group.group.length, 0, 'GroupBuffer group array should be empty when cleared');
    t.equal(group.length, 0, 'GroupBuffer total length should be 0 when cleared');
    t.end();
});

test('extract()', function(t) {
    t.test('Single full buffer', function(t) {
        var group = new BufferGroup(),
            buffer = new Buffer([0x01, 0x02, 0x03]),
            extract_buffer;

        group.push(buffer);
        extract_buffer = group.extract(buffer.length);
        t.ok(array_equals(buffer, extract_buffer.buf), 'Extracted buffer should equal the original buffer in a single full buffer extract');
        t.equal(group.group.length, 0, 'GroupBuffer should be empty after a single full buffer extract');
        t.equal(group.length, 0, 'GroupBuffer total length should be 0 after a single full buffer extract');
        t.end();
    });
    t.test('Multiple full buffers', function(t) {
        var group = new BufferGroup(),
            buffer1 = new Buffer([0x01, 0x02, 0x03]),
            buffer2 = new Buffer([0x04, 0x05, 0x06, 0x07]),
            buffer3 = new Buffer([0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d]),
            extract_buffer,
            concat_buffer;

        group.push(buffer1);
        group.push(buffer2);
        group.push(buffer3);
        concat_buffer = Buffer.concat([buffer1, buffer2, buffer3]);
        extract_buffer = group.extract(buffer1.length + buffer2.length + buffer3.length);
        t.ok(array_equals(concat_buffer, extract_buffer.buf), 'Extracted buffer should equal the original buffer in a multi full buffer extract');
        t.equal(group.group.length, 0, 'GroupBuffer should be empty after a multi full buffer extract');
        t.equal(group.length, 0, 'GroupBuffer total length should be 0 after a multi full buffer extract');
        t.end();
    });
    t.test('Single partial buffer', function(t) {
        var group = new BufferGroup(),
            buffer = new Buffer([0x01, 0x02, 0x03]),
            extract_buffer;

        group.push(buffer);
        extract_buffer = group.extract(1);
        console.log(group);
        t.ok(array_equals(buffer.slice(0, 1), extract_buffer.buf), 'Extracted buffer should equal the original buffer in a single partial extract');
        t.equal(group.group.length, 1, 'GroupBuffer should be the remaining buffers after a single partial extract');
        t.equal(group.length, 2, 'GroupBuffer total length should be what\'s left after a single partial extract');
        t.end();
    });
    t.test('Multiple partial buffers', function(t) {
        var group = new BufferGroup(),
            buffer1 = new Buffer([0x01, 0x02, 0x03]),
            buffer2 = new Buffer([0x04, 0x05, 0x06, 0x07]),
            buffer3 = new Buffer([0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d]),
            extract_buffer,
            concat_buffer;

        group.push(buffer1);
        group.push(buffer2);
        group.push(buffer3);
        concat_buffer = Buffer.concat([buffer1, buffer2.slice(0, parseInt(buffer2.length / 2, 10))]);
        extract_buffer = group.extract(buffer1.length + parseInt(buffer2.length / 2, 10));
        t.ok(array_equals(concat_buffer, extract_buffer.buf), 'Extracted buffer should equal the original buffer in a multi partial buffer extract');
        t.equal(group.group.length, 2, 'GroupBuffer should be the remaining buffers after a multi partial buffer extract');
        t.equal(group.length, 8, 'GroupBuffer total length should be what\'s left after a multi partial extract');
        t.end();
    });
    t.end();
});

function array_equals(b1, b2) {
    if (b1.length !== b2.length) {
        return false;
    }
    for (var i = 0; i < b1.length; i++) {
        if (b1[i] !== b2[i]) {
            return false;
        }
    }
    return true;
}


