# naan.js

Naan.js is a library that provides a set of useful functions for creating
partially applied functions. It was originally created to work with
[node.js](http://nodejs.org) but also works in the browser, so long as you have
also included the [async](https://github.com/caolan/async) module.

The best way to understand what naan does is to see it in action:

## Quick Examples
```javascript

var statFoo = naan.curry(fs.stat, 'foo.txt');
statFoo(function(err, data) {
  // stat result from foo
});

var renameToFoo = naan.positionCurry(fs.rename, fs.rename, 'foo.txt', 1);
renameToFoo('bar.txt', function(err) {
  // 'bar.txt' has been renamed to 'foo.txt'
})

var readFooContents = naan.curry(fs.readFile, 'foo.txt');
var writeFooContents = naan.cook(fs.writeFile, readFooContents, 1);
writeFooContents('bar.txt', function(err) {
  // The contents of 'foo.txt' has been written to 'bar.txt'
})

// Naan works great with Async!
var readers = ['foo.txt', 'bar.txt', 'bob.txt'].map(function(file) {
  return naan.curry(fs.readFile)
});
async.parallel(readers, function(err, contents) {
  // contents == contents of foo.txt, bar.txt & bob.txt
});

```

These are a few of the basic uses of Naan. Each of the available functions are
listed below.

## Download

For node, just use npm:

    npm install naan

## In the Browser

Tested in IE9+. It currently uses some ES5 stuff which doesn't work in IE8, but this will be
fixed shortly.

For info on how to test in the browser, see [testing](#testing).

```html
<script src="async.min.js"></script>
<script src="naan.min.js"></script>
<script>
  var createDiv = naan.curry(document.createElement, 'div');
</script>
```

__Development:__ [naan.js](https://github.com/jonpacker/naan/raw/master/naan.js) - 9.5kb Uncompressed

__Production:__ [naan.min.js](https://github.com/caolan/async/raw/master/naan.min.js) - 3.0kb Minified

## Documentation

### Curries

* [curry](#curry)
* [rightCurry](#rightCurry)
* [curryArgs](#curryArgs)
* [curryArgsRight](#curryArgsRight)
* [positionCurry](#positionCurry)
* [entangleCurry](#entangleCurry)

### Cooking

* [cook](#cook)

### Return control

* [alwaysReturn](#alwaysReturn)

### Group Curries

* [crock](#crock)
* [combine](#combine)