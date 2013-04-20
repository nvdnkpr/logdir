var logdir = require('../');
var ld = logdir('/tmp/logdir');
var ws = ld.createWriteStream('robot');

ld.open('robot').follow(-5).pipe(process.stdout);
ws.write('beep boop\n');
