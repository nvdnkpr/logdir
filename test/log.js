var test = require('tap').test;
var logdir = require('../');
var ld = logdir(__dirname + '/data/log');
var through = require('through');

test('static log data', function (t) {
    t.plan(1);
    
    var lines = [];
    ld.open().slice(-6).pipe(through(write, end));
    function write (line) { lines.push(line) }
    function end () {
        t.deepEqual(lines, [
            'b 300 ccc\n',
            'a 301 EEE\n',
            'a 320 FFF\n',
            'b 400 ddd\n',
            'b 500 eee\n',
            'b 600 fff\n'
        ]);
    }
});
