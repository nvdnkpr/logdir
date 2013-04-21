var sf = require('slice-file');
var fs = require('fs');
var path = require('path');
var inherits = require('inherits');
var through = require('through');
var EventEmitter = require('events').EventEmitter;

module.exports = function (dir) {
    return new Logdir(dir);
};

inherits(Logdir, EventEmitter);

function Logdir (dir) {
    this.dir = dir;
}

Logdir.prototype.createWriteStream = function (name) {
    var file = path.join(this.dir, name);
    var ws = fs.createWriteStream(file, { flags: 'a' });
    var tr = through(function (line) {
        this.queue(Date.now() + ' ' + line);
    });
    tr.pipe(ws);
    return tr;
};

Logdir.prototype.open = function (names, opts) {
    var self = this;
    if (Array.isArray(names)) {
        var files = names.reduce(function (acc, name) {
            acc[name] = self.open(name, opts);
            return acc;
        }, {});
        return {
            slice: tie('slice', files),
            follow: tie('follow', files)
        }
    }
    else {
        return sf(path.join(this.dir, names));
    }
};

function tie (method, files) {
    return function () {
        var args = arguments;
        var tr = through();
        tr.close = function () {
            Object.keys(files).forEach(function (key) {
                files[key].close();
            });
            tr.queue(null);
        };
        var buffer = [];
        var keys = Object.keys(files);
        var pending = keys.length;
        
        keys.forEach(function (key) {
            var s = files[key].slice.apply(files[key], args);
            s.pipe(through(write, end));
            
            function write (line) {
                var stamp = /^(\d+) /.exec(line);
                if (stamp) buffer.push([ stamp[1], line ]);
            }
            function end () {
                if (--pending !== 0) return;
                buffer.sort(function (a, b) { return a[0] - b[0] });
                buffer.slice.apply(buffer, args).forEach(function (msg) {
                    tr.queue(key + ' ' + msg[1]);
                });
                if (method === 'follow') {
                    Object.keys(files).forEach(function (key) {
                        files[key].follow(-1,0).pipe(through(function (line) {
                            this.queue(key + ' ' + line);
                        })).pipe(tr, { end: false });
                    });
                }
                else tr.close();
            }
        });
        return tr;
    };
}

Logdir.prototype.list = function (cb) {
    fs.readdir(this.dir, cb);
};
