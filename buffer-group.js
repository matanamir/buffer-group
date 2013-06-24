/**
 * Does the very simple work of keeping multiple Buffers together
 * to reduce memory allocations.  It only really provides
 * a length property to see how much data we've actually
 * aggregated so we can take action if needed and an extract()
 * method to extract a fixed size amount from the buffer group.
 *
 * This is useful to buffer 'data' event until we have enough to
 * perform an action on it.
 */

module.exports = function(OffsetBuffer, logger) {

    function BufferGroup() {

        /**
         * An array to hold the collection of buffers we are
         * keeping track of.
         */
        this.group = [];

        /**
         * Keep track of the lengths of all the buffers we've
         * collected in a convenient place.
         */
        this.length = 0;
    }

    /**
     * Adds a buffer to the collection.
     */
    BufferGroup.prototype.push = function(buf) {
        if (!Buffer.isBuffer(buf)) {
            throw new TypeError('buf parameter is not a buffer!');
        }

        this.group.push(buf);
        this.length += buf.length;
    };

    /**
     * Returns one newly allocated Buffer which
     * includes the data from all the ones in this
     * group up to the size provided.
     * All the full buffers extracted are removed from
     * the group.  Any buffers that are partially extracted
     * are sliced to their remaining size.
     */
    BufferGroup.prototype.extract = function(size) {
        var extract_buffer = new OffsetBuffer(size),
            new_group = [],
            new_length = 0,
            size_left = size;

        this.group.forEach(function(buf) {
            if (size_left > 0) {
                if (buf.length > size_left) {
                    extract_buffer.copyFrom(buf.slice(0, size_left));
                    new_group.push(buf.slice(size_left));
                    new_length += buf.length - size_left;
                    size_left = 0;
                } else {
                    extract_buffer.copyFrom(buf);
                    size_left -= buf.length;
                }
            } else {
                new_group.push(buf);
                new_length += buf.length;
            }
        });
        this.group = new_group;
        this.length = new_length;
        return extract_buffer;
    };

    /**
     * Clears up the references so we can start fresh
     */
    BufferGroup.prototype.clear = function() {
        // for some reason, for-each w/ pop seems to be the fastest
        // way to do this (see: jsperf.com/array-destroy/15)
        var arr = this.group,
            i = 0,
            len = this.group.length;
        for (; i < len; i++) {
            arr.pop();
        }
        this.length = 0;
    };

    return BufferGroup;
};