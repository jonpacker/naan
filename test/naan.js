if (typeof naan == 'undefined') {
  var naan = require('../naan');
  var assert = require('assert');
}

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

function bmultivide() {
  var tog = true;
  return this.num / [].reduce.call(arguments, function(memo, current) {
    return (tog = !tog) ? memo / current : memo * current;
  });
}

function bdelayedNumber(delay, callback) {
  var self = this;
  setTimeout(function() {
    callback(null, self.num);
  }, delay);
}

describe('Curries', function() {
  describe('leftCurry', function() {
    it('should apply args on the left', function() {
      var sub45 = naan.curry(subtract, 4, 5);
      assert.equal(subtract(4, 5, 6), sub45(6));
    });

    it('should maintain context when supplied', function() {
      var sub45 = naan.b.curry({ num: 5 }, bsubtract, 4, 5);
      assert.equal(5 - subtract(4, 5, 6), sub45(6));
    })

    it('should take an array of functions and curry them all', function() {
      var fns = naan.curry([subtract, multivide], 4, 5);
      assert.equal(subtract(4, 5, 6), fns[0](6));
      assert.equal(multivide(4, 5, 6), fns[1](6));
    });

    it('should take an array of fns and bind & curry them all', function() {
      var fns = naan.b.curry({ num: 5 }, [bsubtract, bmultivide], 4, 5);
      assert.equal(5 - subtract(4, 5, 6), fns[0](6));
      assert.equal(5 / multivide(4, 5, 6), fns[1](6));
    });

    it('should inherit context when not specified', function() {
      var fn = naan.curry(function() {
        assert.ok(this.test === 89);
      }, 'test');
      fn.call({test: 89});
    });

    it('should handle an array argument as a single argument', function() {
      var fn = naan.curry(function(arr) {
        assert.deepEqual(arr, [{test: 1}, {test2: 2}]);
      }, [{test: 1}, {test2: 2}]);
      fn();
    });
  });

  describe('rightCurry', function() {
    it('should apply args on the right', function() {
      var subx56 = naan.rcurry(subtract, 5, 6);
      assert.equal(subtract(4, 5, 6), subx56(4));
    });

    it('should maintain context when supplied', function() {
      var subx56 = naan.b.rcurry({ num: 5 }, bsubtract, 5, 6);
      assert.equal(5 - subtract(4, 5, 6), subx56(4));
    })
  });

  describe('curryArgs', function() {
    it('should apply an array of args on the left', function() {
      var sub456 = naan.currya(subtract, [4, 5, 6]);
      assert.equal(subtract(4, 5, 6, 7, 8), sub456(7, 8));
    });

    it('should maintain context when supplied', function() {
      var sub456 = naan.b.currya({ num: 5 }, bsubtract, [4, 5, 6]);
      assert.equal(5 - subtract(4, 5, 6, 7, 8), sub456(7, 8));
    })
  });

  describe('curryArgsRight', function() {
    it('should apply an array of args on the right', function() {
      var subx56 = naan.rcurrya(subtract, [5, 6]);
      assert.equal(subtract(2, 3, 4, 5, 6), subx56(2, 3, 4));
    })

    it('should maintain context when supplied', function() {
      var subx56 = naan.b.rcurrya({ num: 5 }, bsubtract, [5, 6]);
      assert.equal(5 - subtract(2, 3, 4, 5, 6), subx56(2, 3, 4));
    })
  })

  describe('curryArgsPosition', function() {
    it('should apply an argument at the given position', function() {
      var subx5x = naan.ncurry(subtract, 5, 1);
      assert.equal(subtract(4, 5, 6), subx5x(4, 6));
      assert.equal(subtract(4, 5), subx5x(4));
      assert.equal(subtract(5), subx5x());
    })

    it('should apply an array of args at the given position', function() {
      var subxx56x = naan.ncurry(subtract, [5, 6], 2);
      assert.equal(subtract(3, 4, 5, 6, 7, 8), subxx56x(3, 4, 7, 8));
      assert.equal(subtract(3, 4, 5, 6), subxx56x(3, 4));
      assert.equal(subtract(3, 5, 6), subxx56x(3));
    });

    it('should maintain context when supplied', function() {
      var subxx56x = naan.b.ncurry({ num: 5 }, bsubtract, [5, 6], 2);
      assert.equal(5 - subtract(3, 4, 5, 6, 7, 8), subxx56x(3, 4, 7, 8));
      assert.equal(5 - subtract(3, 4, 5, 6), subxx56x(3, 4));
      assert.equal(5 - subtract(3, 5, 6), subxx56x(3));
    })
  })

  describe('curryEntangle', function() {
    it('should apply an array of args at the given distributed positions', function() {
      var subx4x5x6x = naan.ecurry(subtract, [4, 5, 6], [1, 3, 5]);
      assert.equal(subtract(1, 4, 2, 5, 3, 6), subx4x5x6x(1, 2, 3));
      assert.equal(subtract(1, 4, 2, 5, 6), subx4x5x6x(1, 2));
      assert.equal(subtract(4, 4, 5, 6), subx4x5x6x(4));
      assert.equal(subtract(4, 5, 6), subx4x5x6x());
    })

    it('should handle inconsecutive positions', function() {
      var subx4x5x6x = naan.ecurry(subtract, [6, 4, 5], [5, 1, 3]);
      assert.equal(subtract(1, 4, 2, 5, 3, 6), subx4x5x6x(1, 2, 3));
    })

    it('should handle inconsecutive positions with less args', function() {
      var subx4x5x6x = naan.ecurry(subtract, [6, 4, 5], [5, 1, 3]);
      assert.equal(subtract(1, 4, 2, 5, 6), subx4x5x6x(1, 2));
      assert.equal(subtract(4, 4, 5, 6), subx4x5x6x(4));
      assert.equal(subtract(4, 5, 6), subx4x5x6x());
    })

    it('should apply remaining args at the last matching position', function() {
      var subx4x5x6x = naan.ecurry(subtract, [4, 5, 6], [1, 3]);
      assert.equal(subtract(1, 4, 2, 5, 6, 3), subx4x5x6x(1, 2, 3));
      assert.equal(subtract(1, 4, 2, 5, 6), subx4x5x6x(1, 2));
      assert.equal(subtract(4, 4, 5, 6), subx4x5x6x(4));
      assert.equal(subtract(4, 5, 6), subx4x5x6x());
    })

    it('should ignore extra positions', function() {
      var subx4x5x6x = naan.ecurry(subtract, [4, 5, 6], [1, 3, 5, 7, 9]);
      assert.equal(subtract(1, 4, 2, 5, 3, 6), subx4x5x6x(1, 2, 3));
      assert.equal(subtract(1, 4, 2, 5, 6), subx4x5x6x(1, 2));
      assert.equal(subtract(4, 4, 5, 6), subx4x5x6x(4));
      assert.equal(subtract(4, 5, 6), subx4x5x6x());
    })

    it('should maintain context when supplied', function() {
      var subx4x5x6x = naan.b.ecurry({ num: 5 }, bsubtract, [4, 5, 6], [1, 3, 5]);
      assert.equal(5 - subtract(1, 4, 2, 5, 3, 6), subx4x5x6x(1, 2, 3));
      assert.equal(5 - subtract(1, 4, 2, 5, 6), subx4x5x6x(1, 2));
      assert.equal(5 - subtract(4, 4, 5, 6), subx4x5x6x(4));
      assert.equal(5 - subtract(4, 5, 6), subx4x5x6x());
    })
  })

})

describe('Cooking', function() {
  it('should resolve args in the correct order and apply them', function(done) {
    var find10 = naan.curry(delayedNumber, 12, 10);
    var find20 = naan.curry(delayedNumber, 4, 20);

    var cookedsub = naan.cook(subtract, [find10, find20], true, false);
    cookedsub(function(err, value) {
      assert.ok(!err);
      assert.equal(value, subtract(10, 20));
      done();
    });
  })

  it('should apply arguments in the correct positions', function(done) {
    var complsub = function(x, y, callback, z, n) {
      delayedNumber(4, 10, function(err, j) {
        callback(null, x - y - z - n - j);
      });
    }
    
    var find5 = naan.curry(delayedNumber, 18, 5);
    var find6 = naan.curry(delayedNumber, 4, 6);

    var ccook = naan.cook(complsub, [find5, find6], [1, 3], 2);
    var extraComplCook = naan.rcurry(ccook, 8);

    extraComplCook(2, function(err, value) {
      assert.ok(!err);
      assert.equal(value, subtract(2, 5, 6, 8, 10));
      done();
    });
  });

  it('should maintain context when supplied', function(done) {
    var find10 = naan.b.curry({num: 10}, bdelayedNumber, 4);
    var find20 = naan.b.curry({num: 20}, bdelayedNumber, 18);

    var cookedsub = naan.b.cook({num: 5}, bsubtract, [find10, find20], true, false);
    cookedsub(function(err, value) {
      assert.ok(!err);
      assert.equal(value, 5 - subtract(10, 20));
      done();
    });
  });

  it('should have the correct argument order if context is supplied', function(done) {
    var complsub = function(x, y, callback, z, n) {
      var xnum = this.num;
      delayedNumber(6, 10, function(err, j) {
        callback(null, xnum - x - y - z - n - j);
      });
    }
    
    var find5 = naan.b.curry({num: 5}, bdelayedNumber, 2);
    var find6 = naan.b.curry({num: 6}, bdelayedNumber, 4);

    var ccook = naan.b.cook({num: 10}, complsub, [find5, find6], [1, 3], 2);
    var extraComplCook = naan.rcurry(ccook, 8);

    extraComplCook(2, function(err, value) {
      assert.ok(!err);
      assert.equal(value, subtract(10, 2, 5, 6, 8, 10));
      done();
    });
  })
});

describe('Tupperware', function() {
  it('should always return the given value', function() {
    var wrapped = naan.tupperware(subtract, 'Mega Cucumber!');
    assert.equal(wrapped(4, 8, 3), 'Mega Cucumber!');
    assert.notEqual(wrapped(4, 8, 3), subtract(4, 8, 3));
  })

  it('should preserve the original logic', function() {
    var sideEffect = 0;

    function causeSideEffect(incAmount, incAmount2, incAmount3) {
      sideEffect += incAmount + incAmount2 + incAmount3;
      return sideEffect;
    }

    var wrapped = naan.tupperware(causeSideEffect, 'Mega Cucumber!');
    assert.equal(wrapped(1, 2, 3), 'Mega Cucumber!');
    assert.equal(sideEffect, 6);
    assert.equal(causeSideEffect(2, 3, 4), 15); 
  });

  it('should preserve context if supplied', function() { 
    var wrapped = naan.b.tupperware({ num: 5 }, bsubtract, 'Mega Cucumber!');
    assert.equal(wrapped(4, 8, 3), 'Mega Cucumber!');
    assert.notEqual(wrapped(4, 8, 3), subtract(4, 8, 3));
  });

  it('should preserve logic relying on a context if supplied', function() {
    var sideEffect = 0;

    function causeSideEffect(incAmount, incAmount2, incAmount3) {
      sideEffect += this.num + incAmount + incAmount2 + incAmount3;
      return sideEffect;
    }

    var wrapped = naan.b.tupperware({ num: 5 }, causeSideEffect, 'Mega Cucumber!');
    assert.equal(wrapped(1, 2, 3), 'Mega Cucumber!');
    assert.equal(sideEffect, 11);
  })
});

describe('Crocks/Group Curries', function() {
  it('should curry every function on an object', function() {
    var obj = {
      sub: subtract,
      mv: multivide
    };

    var cobj = naan.crock(obj, naan.curry, 5, 15);

    assert.equal(cobj.sub(10, 20), subtract(5, 15, 10, 20));
    assert.equal(cobj.mv(2, 7), multivide(5, 15, 2, 7));  
  });

  it('should maintain original non-function properties', function() {
    var fns = {
      sub: subtract, 
      bob: 'bob', 
      num: 5, 
      food: {potato:'PIE'}, 
      mv: multivide
    };
    var cfns = naan.crock(fns, naan.curry, 5, 15);
    assert.equal(cfns.sub(10, 20), subtract(5, 15, 10, 20));
    assert.equal(cfns.mv(2, 7), multivide(5, 15, 2, 7));
    assert.ok(cfns.bob === fns.bob);
    assert.ok(cfns.num === cfns.num);
    assert.deepEqual(cfns.food, fns.food);
  });

  it('should curry every function in an array', function() {
    var fns = [subtract, multivide];
    var cfns = naan.crock(fns, naan.curry, 5, 15);
    assert.equal(cfns[0](10, 20), subtract(5, 15, 10, 20));
    assert.equal(cfns[1](2, 7), multivide(5, 15, 2, 7));
  })

  it('should not alter non-function values in a array', function() {
    var fns = [subtract, 'bob', 5, {potato:'PIE'}, multivide];
    var cfns = naan.crock(fns, naan.curry, 5, 15);
    assert.equal(cfns[0](10, 20), subtract(5, 15, 10, 20));
    assert.equal(cfns[4](2, 7), multivide(5, 15, 2, 7));
    assert.ok(cfns[1] === fns[1]);
    assert.ok(cfns[2] === fns[2]);
    assert.deepEqual(cfns[3], fns[3]);
  });

  it('should not attempt to re-curry a duplicate function', function() {
    var fns = {suba: subtract, subb: subtract, subx: subtract};
    var cfns = naan.crock(fns, naan.curry, 5, 15);
    assert.equal(cfns.suba(10, 20), subtract(5, 15, 10, 20));
    assert.equal(cfns.subb(10, 20), subtract(5, 15, 10, 20));
    assert.equal(cfns.subx(10, 20), subtract(5, 15, 10, 20));
  })
  
  it('should extend a base object when used as an extendCrock', function() {
    var base = { _test_thing: 'test', _other_thing: 1234, _mv: multivide };
    var obj = { sub: subtract, mv: multivide };

    var cobj = naan.ecrock(base, obj, naan.curry, 5, 15);
    
    assert.equal(cobj.sub(10, 20), subtract(5, 15, 10, 20));
    assert.equal(cobj.mv(2, 7), multivide(5, 15, 2, 7));  
    assert.equal(cobj._mv(2, 4, 5, 6, 30), multivide(2, 4, 5, 6, 30));
    assert.equal(cobj._test_thing, 'test');
    assert.equal(cobj._other_thing, 1234);
  });

  it('should perform recursive group currying', function() {
    var obj = {
      mv: multivide,
      sub_thing: {
        sub: subtract,
        subsub_thing: {
          mv: multivide
        }
      }
    };
    var base = { sub: subtract };

    var cobj = naan.recursiveExtendCrock(base, obj, naan.curry, 10, 12);

    assert.equal(cobj.mv(5, 6), multivide(10, 12, 5, 6));
    assert.equal(cobj.sub(5, 6), subtract(5, 6));
    assert.equal(cobj.sub_thing.sub(5, 6), subtract(10, 12, 5, 6));
    assert.equal(cobj.sub_thing.subsub_thing.mv(8), multivide(10, 12, 8));
  })
});

describe('Combine', function() {
  it('should combine a array of functions with an array of values', function() {
    var fns = [ subtract, multivide ];
    var vals = [ 5, 10 ];

    var combined = naan.combine(fns, vals);

    assert.equal(combined[0](10, 15), subtract(5, 10, 15));
    assert.equal(combined[1](8, 12), multivide(10, 8, 12));
  });

  it('should combine an object with a shell with curry args', function() {
    var fns = { sub: subtract, mv: multivide };
    var cargs = { sub: [5, 6], mv: [7, 9, 12] };

    var combined = naan.combine(fns, cargs);

    assert.equal(combined.sub(10, 12), subtract(5, 6, 10, 12));
    assert.equal(combined.mv(15, 14), multivide(7, 9, 12, 15, 14));
  });
  
  it('should use a supplied curry function', function() {
    var fns = [ subtract, multivide ];
    var vals = [ 5, 10 ];

    var combined = naan.combine(fns, vals, naan.rcurry);

    assert.equal(combined[0](10, 15), subtract(10, 15, 5));
    assert.equal(combined[1](8, 12), multivide(8, 12, 10));
  });

  it('should not accept arrays of varying size', function() {
    var fns = [multivide, subtract];
    var cargs = [1,2,3];

    assert.ok(naan.combine(fns, cargs) === undefined);
  });

  it('should extend an object if supplied', function() {
    var fns = { sub: subtract };
    var base = { mv: multivide };
    var args = { sub: 8, mv: 5 };

    var com = naan.ecombine(base, fns, args);

    assert.deepEqual(com, base);
    assert.equal(base.sub(9, 10), subtract(8, 9, 10));
    assert.equal(base.mv(9, 10, 11), multivide(9, 10, 11));
  });
});

