var logdir = require('../');
var test = require('tap').test;
var fs = require('fs');
var path = require('path');
var through = require('through');

var os = require('os');
var mkdirp = require('mkdirp');

var tmpdir = path.join(os.tmpDir(), 'logdir-test', String(Math.random()));
mkdirp.sync(tmpdir);

var ld = logdir(tmpdir);
var a = ld.createWriteStream('a');
var b = ld.createWriteStream('b');

test('setup', function (t) {
    var xs = [ 'aaa', 'bbb', 'AAA', 'ccc', 'BBB', 'CCC', 'ddd', 'DDD' ];
    (function shift () {
        if (xs.length === 0) return t.end();
        var x = xs.shift();
        if (x.toUpperCase() === x) a.write(x + '\n')
        else b.write(x + '\n')
        setTimeout(shift, 25);
    })();
});

test('slice', function (t) {
    t.plan(1);
    
    var lines = [];
    ld.open([ 'a', 'b' ]).slice(-5).pipe(through(write, end));
    
    function write (line) {
        lines.push(line);
    }
    function end () {
        t.deepEqual(lines.map(function (line) {
            return line.replace(/^\S+\s\d+ /, '');
        }), [ 'ccc\n', 'BBB\n', 'CCC\n', 'ddd\n', 'DDD\n' ]);
    }
});

test('teardown', function (t) {
    a.end();
    b.end();
    t.end();
});
