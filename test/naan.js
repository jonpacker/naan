var naan = require('../naan');

function multiply() {
  return [].reduce.call(arguments, function(memo, current) {
    return memo * current;
  });
}

function delayedNumber(delay, number, callback) {
  setTimeout(function() {
    callback(null, number);
  }, delay);
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

exports['curryArgsPosition'] = function(beforeExit, assert) {
  var multxx56x = naan.ncurry(multiply, [5, 6], 2);
  assert.equal(multiply(3, 4, 5, 6, 7, 8), multxx56x(3, 4, 7, 8));
  assert.equal(multiply(3, 4, 5, 6), multxx56x(3, 4));
  assert.equal(multiply(3, 5, 6), multxx56x(3));

  var multx5x = naan.ncurry(multiply, 5, 1);
  assert.equal(multiply(4, 5, 6), multx5x(4, 6));
  assert.equal(multiply(4, 5), multx5x(4));
  assert.equal(multiply(5), multx5x());
}

exports['curryEntagle'] = function(beforeExit, assert) {
  var multx4x5x6x = naan.ecurry(multiply, [4, 5, 6], [1, 3, 5]);
  assert.equal(multiply(1, 4, 2, 5, 3, 6), multx4x5x6x(1, 2, 3));
  assert.equal(multiply(1, 4, 2, 5, 6), multx4x5x6x(1, 2));
  assert.equal(multiply(4, 4, 5, 6), multx4x5x6x(4));
  assert.equal(multiply(4, 5, 6), multx4x5x6x());
}

exports['cook'] = function(beforeExit, assert) {
  var find10 = naan.curry(delayedNumber, 50, 10);
  var find20 = naan.curry(delayedNumber, 50, 20);

  var cookedmult = naan.cook(multiply, [find10, find20]);
  cookedmult(function(err, value) {
    assert.ok(!err);
    assert.equal(multiply(10, 20), value);
  });
}

exports['complicated cooking'] = function(be, assert) {
  var complmult = function(x, y, callback, z, n) {
    delayedNumber(50, 10, function(err, j) {
      callback(x * y * z * n * j);
    });
  }
  
  find5 = naan.curry(delayedNumber, 20, 5);
  find6 = naan.curry(delayedNumber, 20, 6);

  var ccook = naan.cook(complmult, [find5, find6], [1, 3], 2);
  var extraComplCook = naan.rcurry(ccook, 8);
  extraComplCook(2, function(err, value) {
    assert.ok(!err);
    assert.equal(value, multiply(2, 5, 6, 8, 10));
  });
}
