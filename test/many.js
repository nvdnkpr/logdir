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

test('follow', function (t) {
    t.plan(1);
    
    var lines = [];
    var s = ld.open([ 'a', 'b' ]).follow(-5);
    s.pipe(through(write, end));
    
    function write (line) {
        lines.push(line);
        if (lines.length === 5) {
            t.deepEqual(
                lines.map(strip),
                [ 'ccc\n', 'BBB\n', 'CCC\n', 'ddd\n', 'DDD\n' ]
            );
            a.write('xyz\n');
            setTimeout(function () { b.write('XYZ\n') }, 50);
            setTimeout(function () { s.close() }, 50);
        }
    }
    
    function end () {
        t.deepEqual(
            lines.slice(-2).map(strip),
            [ 'xyz\n', 'XYZ\n' ]
        );
    }
});

test('teardown', function (t) {
    a.end();
    b.end();
    t.end();
});

function strip (line) {
    return line.replace(/^\S+\s\d+ /, '');
}
