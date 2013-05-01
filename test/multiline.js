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

test('create files with multi-line output', function (t) {
    t.plan(1);
    t.on('end', function () { s.close() });
    
    var s = ld.opendir();
    var lines = [];
    s.follow().pipe(through(write));
    
    setTimeout(function () {
        var ws = fs.createWriteStream(tmpdir + '/a');
        ws.write('1 abc\n');
        setTimeout(function () {
            ws.end('5 nop\n');
        }, 100);
    }, 100);
    
    setTimeout(function () {
        var ws = fs.createWriteStream(tmpdir + '/b');
        ws.write('2 def\n3 hij');
        setTimeout(function () {
            ws.end('4 klm\n');
        }, 20);
    }, 150);
    
    setTimeout(function () {
        t.deepEqual(lines, [
            'a 1 abc\n',
            'b 2 def\n',
            'b 3 hij\n',
            'b 4 klm\n',
            'a 5 nop\n'
        ]);
    }, 250);
    
    function write (line) {
        lines.push(line);
    }
});
