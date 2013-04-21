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
        
        Object.keys(files).forEach(function (key) {
            var s = files[key][method].apply(files[key], args);
            s.pipe(through(function (line) {
                console.dir(line);
            }));
        });
        return tr;
    };
}

Logdir.prototype.list = function (cb) {
    fs.readdir(this.dir, cb);
};
