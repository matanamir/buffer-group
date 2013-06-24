# buffer-group

Group Node.js Buffers together and extract the parts you need.  This is useful, for example, when
dealing with framing data and the frame size isn't known in advance.


## Example

Get access to the BufferGroup:

```js
var BufferGroup = require('buffer-group'),
    bg = new BufferGroup();
```

Add buffers to the group:

```js
bg.push(new Buffer(10));    // bg.length === 10
bg.push(new Buffer(5));     // bg.length === 15
```

As you add Buffers to the group, the BufferGroup length grows accordingly to account for all the buffers in it.

You can then extract a fixed size of data from the group:

```js
var eb = bg.extract(12); // Extract 12 bytes from the BufferGroup.
// eb.length === 12
// bg.length === 3
```

Note that the BufferGroup will remove the number of bytes requested and keep any existing data there.
You can then go ahead and push more data in or extract more data as you see fit.  The `length` property
should reflect the current size.

## Install

```
npm install buffer-group
```

## Tests

```
npm test
```

## License

MIT License
