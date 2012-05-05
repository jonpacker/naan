var naan = require('../naan');

function multiply() {
  return [].reduce.call(arguments, function(memo, current) {
    return memo * current;
  });
}

exports['curry'] = function(beforeExit, assert) {
  var mult45 = naan.curry(multiply, 4, 5);
  assert.equal(multiply(4, 5, 6), mult45(6));
}

exports['curryRight'] = function(beforeExit, assert) {
  var multx56 = naan.rcurry(multiply, 5, 6);
  assert.equal(multiply(4, 5, 6), multx56(4));
}

exports['curryArgs'] = function(beforeExit, assert) {
  var mult456 = naan.currya(multiply, [4, 5, 6]);
  assert.equal(multiply(4, 5, 6, 7, 8), mult456(7, 8));
}

exports['curryArgsRight'] = function(beforeExit, assert) {
  var multx56 = naan.rcurrya(multiply, [5, 6]);
  assert.equal(multiply(2, 3, 4, 5, 6), multx56(2, 3, 4));
}

