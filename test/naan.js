var naan = require('../naan');
var assert = require('assert');

function subtract() {
  return [].reduce.call(arguments, function(memo, current) {
    return memo - current;
  });
}

function multivide() {
  var tog = true;
  return [].reduce.call(arguments, function(memo, current) {
    return (tog = !tog) ? memo / current : memo * current;
  });
}

function delayedNumber(delay, number, callback) {
  setTimeout(function() {
    callback(null, number);
  }, delay);
}

function bsubtract() {
  return (this.num || 0) - [].reduce.call(arguments, function(memo, current) {
    return memo - current;
  });
}

function bdelayedNumber(delay, callback) {
  var self = this;
  setTimeout(function() {
    callback(null, self.num);
  }, delay);
}

exports['curry'] = function() {
  var sub45 = naan.curry(subtract, 4, 5);
  assert.equal(subtract(4, 5, 6), sub45(6));
}

exports['curryRight'] = function() {
  var subx56 = naan.rcurry(subtract, 5, 6);
  assert.equal(subtract(4, 5, 6), subx56(4));
}

exports['curryArgs'] = function() {
  var sub456 = naan.currya(subtract, [4, 5, 6]);
  assert.equal(subtract(4, 5, 6, 7, 8), sub456(7, 8));
}

exports['curryArgsRight'] = function() {
  var subx56 = naan.rcurrya(subtract, [5, 6]);
  assert.equal(subtract(2, 3, 4, 5, 6), subx56(2, 3, 4));
}

exports['curryArgsPosition'] = function() {
  var subxx56x = naan.ncurry(subtract, [5, 6], 2);
  assert.equal(subtract(3, 4, 5, 6, 7, 8), subxx56x(3, 4, 7, 8));
  assert.equal(subtract(3, 4, 5, 6), subxx56x(3, 4));
  assert.equal(subtract(3, 5, 6), subxx56x(3));

  var subx5x = naan.ncurry(subtract, 5, 1);
  assert.equal(subtract(4, 5, 6), subx5x(4, 6));
  assert.equal(subtract(4, 5), subx5x(4));
  assert.equal(subtract(5), subx5x());
}

exports['curryEntagle'] = function() {
  var subx4x5x6x = naan.ecurry(subtract, [4, 5, 6], [1, 3, 5]);
  assert.equal(subtract(1, 4, 2, 5, 3, 6), subx4x5x6x(1, 2, 3));
  assert.equal(subtract(1, 4, 2, 5, 6), subx4x5x6x(1, 2));
  assert.equal(subtract(4, 4, 5, 6), subx4x5x6x(4));
  assert.equal(subtract(4, 5, 6), subx4x5x6x());
}

exports['cook'] = function(done) {
  var find10 = naan.curry(delayedNumber, 50, 10);
  var find20 = naan.curry(delayedNumber, 50, 20);

  var cookedsub = naan.cook(subtract, [find10, find20], true, false);
  cookedsub(function(err, value) {
    assert.ok(!err);
    assert.equal(value, subtract(10, 20));
    done();
  });
}

exports['complicated cooking'] = function(done) {
  var complsub = function(x, y, callback, z, n) {
    delayedNumber(50, 10, function(err, j) {
      callback(null, x - y - z - n - j);
    });
  }
  
  find5 = naan.curry(delayedNumber, 20, 5);
  find6 = naan.curry(delayedNumber, 20, 6);

  var ccook = naan.cook(complsub, [find5, find6], [1, 3], 2);
  var extraComplCook = naan.rcurry(ccook, 8);

  extraComplCook(2, function(err, value) {
    assert.ok(!err);
    assert.equal(value, subtract(2, 5, 6, 8, 10));
    done();
  });
}

exports['tupperware wrapping'] = function() {
  var wrapped = naan.tupperware(subtract, 'Mega Cucumber!');
  assert.equal(wrapped(4, 8, 3), 'Mega Cucumber!');
  assert.notEqual(wrapped(4, 8, 3), subtract(4, 8, 3));
}

exports['tupperware preserves original code'] = function() {
  var sideEffect = 0;

  function causeSideEffect(incAmount, incAmount2, incAmount3) {
    sideEffect += incAmount + incAmount2 + incAmount3;
    return sideEffect;
  }

  var wrapped = naan.tupperware(causeSideEffect, 'Mega Cucumber!');
  assert.equal(wrapped(1, 2, 3), 'Mega Cucumber!');
  assert.equal(sideEffect, 6);
  assert.equal(causeSideEffect(2, 3, 4), 15);
}

exports['bound curry'] = function() {
  var sub45 = naan.b.curry({ num: 5 }, bsubtract, 4, 5);
  assert.equal(5 - subtract(4, 5, 6), sub45(6));
}

exports['bound curryRight'] = function() {
  var subx56 = naan.b.rcurry({ num: 5 }, bsubtract, 5, 6);
  assert.equal(5 - subtract(4, 5, 6), subx56(4));
}

exports['bound curryArgs'] = function() {
  var sub456 = naan.b.currya({ num: 5 }, bsubtract, [4, 5, 6]);
  assert.equal(5 - subtract(4, 5, 6, 7, 8), sub456(7, 8));
}

exports['bound curryArgsRight'] = function() {
  var subx56 = naan.b.rcurrya({ num: 5 }, bsubtract, [5, 6]);
  assert.equal(5 - subtract(2, 3, 4, 5, 6), subx56(2, 3, 4));
}

exports['bound curryArgsPosition'] = function() {
  var subxx56x = naan.b.ncurry({ num: 5 }, bsubtract, [5, 6], 2);
  assert.equal(5 - subtract(3, 4, 5, 6, 7, 8), subxx56x(3, 4, 7, 8));
  assert.equal(5 - subtract(3, 4, 5, 6), subxx56x(3, 4));
  assert.equal(5 - subtract(3, 5, 6), subxx56x(3));

  var subx5x = naan.b.ncurry({ num: 5 }, bsubtract, 5, 1);
  assert.equal(5 - subtract(4, 5, 6), subx5x(4, 6));
  assert.equal(5 - subtract(4, 5), subx5x(4));
  assert.equal(5 - subtract(5), subx5x());
}

exports['bound curryEntagle'] = function() {
  var subx4x5x6x = naan.b.ecurry({ num: 5 }, bsubtract, [4, 5, 6], [1, 3, 5]);
  assert.equal(5 - subtract(1, 4, 2, 5, 3, 6), subx4x5x6x(1, 2, 3));
  assert.equal(5 - subtract(1, 4, 2, 5, 6), subx4x5x6x(1, 2));
  assert.equal(5 - subtract(4, 4, 5, 6), subx4x5x6x(4));
  assert.equal(5 - subtract(4, 5, 6), subx4x5x6x());
}

exports['bound cook'] = function() {
  var find10 = naan.curry(delayedNumber, 50, 10);
  var find20 = naan.curry(delayedNumber, 50, 20);

  var cookedsub = naan.b.cook({ num: 5 }, bsubtract, [find10, find20], true, false);
  var cookResult;
  cookedsub(function(err, value) {
    assert.ok(!err);
    cookResult = value;
  });

  beforeExit(function() {
    assert.equal(cookResult, 5 - subtract(10, 20));
  }); 
}

exports['group curry - object'] = function() {
  var obj = {
    sub: subtract,
    mv: multivide
  };

  cobj = naan.crock(obj, naan.curry, 5, 15);

  assert.equal(cobj.sub(10, 20), subtract(5, 15, 10, 20));
  assert.equal(cobj.mv(2, 7), multivide(5, 15, 2, 7));
}

exports['group curry - array'] = function() {
  var fns = [subtract, multivide];
  cfns = naan.crock(fns, naan.curry, 5, 15);
  assert.equal(cfns[0](10, 20), subtract(5, 15, 10, 20));
  assert.equal(cfns[1](2, 7), multivide(5, 15, 2, 7));
}

exports['bound tupperware wrapping'] = function() {
  var wrapped = naan.b.tupperware({ num: 5 }, bsubtract, 'Mega Cucumber!');
  assert.equal(wrapped(4, 8, 3), 'Mega Cucumber!');
  assert.notEqual(wrapped(4, 8, 3), subtract(4, 8, 3));
}

exports['bound tupperware preserves original code'] = function() {
  var sideEffect = 0;

  function causeSideEffect(incAmount, incAmount2, incAmount3) {
    sideEffect += this.num + incAmount + incAmount2 + incAmount3;
    return sideEffect;
  }

  var wrapped = naan.b.tupperware({ num: 5 }, causeSideEffect, 'Mega Cucumber!');
  assert.equal(wrapped(1, 2, 3), 'Mega Cucumber!');
  assert.equal(sideEffect, 11);
}

exports['bound cook'] = function(done) {
  var find10 = naan.b.curry({num: 10}, bdelayedNumber, 50);
  var find20 = naan.b.curry({num: 20}, bdelayedNumber, 50);

  var cookedsub = naan.b.cook({num: 5}, bsubtract, [find10, find20], true, false);
  cookedsub(function(err, value) {
    assert.ok(!err);
    assert.equal(value, 5 - subtract(10, 20));
    done();
  });
}

exports['bound complicated cooking'] = function(done) {
  var complsub = function(x, y, callback, z, n) {
    var xnum = this.num;
    delayedNumber(50, 10, function(err, j) {
      callback(null, xnum - x - y - z - n - j);
    });
  }
  
  find5 = naan.b.curry({num: 5}, bdelayedNumber, 20);
  find6 = naan.b.curry({num: 6}, bdelayedNumber, 20);

  var ccook = naan.b.cook({num: 10}, complsub, [find5, find6], [1, 3], 2);
  var extraComplCook = naan.rcurry(ccook, 8);

  extraComplCook(2, function(err, value) {
    assert.ok(!err);
    assert.equal(value, subtract(10, 2, 5, 6, 8, 10));
    done();
  });
}
