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

```