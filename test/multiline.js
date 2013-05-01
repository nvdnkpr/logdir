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
    s.follow().pipe(through(function (line) { lines.push(line) }));
    
    var ws = fs.createWriteStream(tmpdir + '/a');
    var msg = '';
    for (var i = 0; i < 10; i++) {
        msg += i + ' ' + (Math.random() * Math.pow(16, 8)).toString(16) + '\n';
    }
    ws.write(msg);
    
    setTimeout(function () {
        t.deepEqual(lines,
            msg.split('\n').slice(0,-1)
            .map(function (s) { return 'a ' + s + '\n' })
        );
    }, 250);
});
