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
            'a 300 ccc\n',
            'b 301 EEE\n',
            'b 320 FFF\n',
            'a 400 ddd\n',
            'a 500 eee\n',
            'a 600 fff\n'
        ]);
    }
});
