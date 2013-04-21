var logdir = require('../');
var ld = logdir('/tmp/logdir');
ld.open().follow(-5).pipe(process.stdout);
