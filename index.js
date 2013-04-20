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

Logdir.prototype.open = function (name, opts) {
    return sf(path.join(this.dir, name));
};

Logdir.prototype.list = function (cb) {
    fs.readdir(this.dir, cb);
};
