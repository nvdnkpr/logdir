# logdir

dump text streams into a directory and read the data back intelligently

[![build status](https://secure.travis-ci.org/substack/logdir.png)](http://travis-ci.org/substack/logdir)

# example

You can just create some writable streams and read the data back for a single
file:

``` js
var logdir = require('logdir');
var ld = logdir('/tmp/logdir');
var ws = ld.createWriteStream('robot');

ld.open('robot').follow(-5).pipe(process.stdout);
ws.write('beep boop\n');
```

```
$ node example/log.js
1366537631914 beep boop
1366537651318 beep boop
1366537657376 beep boop
```

or you can handle multiple log files at once:

```
var logdir = require('logdir');
var ld = logdir('/tmp/logdir');
var a = ld.createWriteStream('a');
var b = ld.createWriteStream('b');
setInterval(function () {
    a.write(String.fromCharCode(Math.random() * 26 + 97) + '\n');
}, 1000);

setInterval(function () {
    b.write(String.fromCharCode(Math.random() * 26 + 65) + '\n');
}, 1000);

ld.open([ 'a', 'b' ]).follow(-5).pipe(process.stdout);
```

```
$ node example/many.js 
a 1366537714837 v
b 1366537714838 Z
a 1366537715837 o
b 1366537715838 N
a 1366537716839 u
b 1366537716839 O
a 1366537717839 z
b 1366537717839 X
```

or you can even follow files that don't exist yet:

```
var logdir = require('logdir');
var ld = logdir('/tmp/logdir');
ld.open().follow(-5).pipe(process.stdout);
```

```
$ node all.js &
[1] 8545
$ echo $(node -pe 'Date.now()') beep >> /tmp/logdir/newfile
newfile 1366537884613 beep
$ echo $(node -pe 'Date.now()') boop >> /tmp/logdir/newfile
newfile 1366537892127 boop
$ echo $(node -pe 'Date.now()') whoa >> /tmp/logdir/anotherfile
anotherfile 1366537899027 whoa
$ kill %%
```

# methods

``` js
var logdir = require('logdir')
```

## var ld = logdir(dir)

Create a new logdir instance `ld` from a directory `dir`.

## var sf = ld.open(names)

Create a [slice-file](https://github.com/substack/slice-file) handle `sf` to
operate on all the `names` collectively.

If `names` is:

* a string - only slice a single log file of its name
* an array - slice the combined output of each log file, prepending `"$name "`
to the output stream
* undefined - slice the combined output of each log file in the directory and
watch the directory for new files when running `.follow()`

## sf.slice(begin, end)

Like `[].slice()`, but returns a stream of the line numbers that satisfy the
`begin` and `end` constraints.

This method comes from the underlying
[slice-file](https://github.com/substack/slice-file) module but may act on
multiple files at once intelligently.

## sf.follow(begin, end)

Returns an `sf.slice()` stream but watches the file and outputs all new content,
like `tail -f`.

This method comes from the underlying
[slice-file](https://github.com/substack/slice-file) module but may act on
multiple files at once intelligently.

# install

With [npm](https://npmjs.org) do:

```
npm install logdir
```

# license

MIT
