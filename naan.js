(function(undefined) {
  var async, 
      naan = {}, 
      root = this;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = naan;
    async = require('async');
  } else {
    root.naan = naan;
    if (root.async) {
      async = root.async;
    } else {
      throw 'Naan requires the "async" module. Get it from ' +
            'https://github.com/caolan/async.git';
    }
  }
    
  // fn: the function to curry
  // args: the args to create a curry with
  // position: if (true|false) - true = curry args at the start of the arg list
  //                           - false = curry args at the end of the arg list
  //           if numeric, indicates the location in the args list to insert the
  //             args. if this position is great than the length of the passed args,
  //             then the args are added at the end
  function curry(fn, curryArgs, pos) {
    return function() {
      return fn.apply(this, garnish(arguments, curryArgs, pos));
    }
  }

  // This creates a curried function which asynchronously resolves the arguments 
  // by calling the `ingredients` functions before `fn` is called.
  //
  // fn               The function to curry. 
  //
  // ingredients      The function(s) to resolve before calling `fn`. These must
  //                  be of the signature `function(callback) {}`. The callback
  //                  takes 2 arguments, the first being `err`, and the second 
  //                  being parameter that will be passed to `fn` (its position
  //                  depends on `recipe`, otherwise it will be inserted at the
  //                  start of the parameter list). 
  //
  //                  If `err` is not falsy, `fn`'s callback will be called with
  //                  that object rather than `fn`.
  //
  // recipe           Optional. The locations in the parameter list to insert the
  //                  results from the ingredients. Valid values are true, false,
  //                  a number, or an array of numbers the same size as
  //                  ingredients. See the `curry` docs for details.
  //
  // callbackPosition Optional. The location in the parameter list of the
  //                  `fn`'s callback after the values from the cooked
  //                  ingredients are added. If this is falsy or negative, it
  //                  assumes the last parameter in the list. If null or false, it
  //                  indicates `fn` doesn't know about the callback so `cook`
  //                  should call it manually. If false, it indicates that
  //                  callback should /not/ be passed to `fn`. If you specify this
  //                  parameter you must specify `recipe` aswell.
  //
  // noParallel       Optional. If set to true, the `ingredients` functions are
  //                  run in series, rather than parallel. If you specify this
  //                  parameter you must specify `recipe` & `callbackPosition`
  //                  as well.
  naan.cook =
  function cook(fn, ingredients, recipe, callbackPosition, noParallel) {
    var oven = noParallel ? async.series : async.parallel;
    var originalCbPosition = callbackPosition;
    if (!Array.isArray(ingredients)) {
      ingredients = [ ingredients ];
    }

    return function() {
      var smorgasbord = [].slice.call(arguments);

      if (!callbackPosition || callbackPosition < 0) {
        callbackPosition = smorgasbord.length - 1;
      } else {
        if (typeof recipe === 'number' && recipe < callbackPosition) {
          callbackPosition--;
        } else if (recipe === undefined || recipe === true) {
          callbackPosition--;
        } else {
          for (index in recipe) {
            if (recipe[index] < callbackPosition) {
              callbackPosition--;
            }
          }
        }
      }

      var callback = smorgasbord[callbackPosition];
      if (originalCbPosition === false) {
        smorgasbord = [].concat(
          smorgasbord.slice(0, callbackPosition),
          smorgasbord.slice(callbackPosition + 1)
        );
      }

      if (typeof callback !== 'function') {
        return;
      }

      oven(ingredients, function(err, vegetables) {
        if (err) {
          callback(err);
        } else {
          var result = fn.apply(this, garnish(smorgasbord, vegetables, recipe));
          if (originalCbPosition === false || originalCbPosition === null) {
            callback(null, result);
          }
        }
      });
    };
  }

  function garnish(args, curryArgs, pos) {
    var opargs = Array.prototype;
    if (pos === undefined || pos === true || pos === 0 || pos < 0) {
      opargs = curryArgs.concat(opargs.slice.call(args));
    } else if (pos === false || args.length < pos) {
      opargs = opargs.slice.call(args).concat(curryArgs);
    } else if (Array.isArray(pos)) {
      opargs = opargs.slice.call(args);
      for (index in pos) {
        opargs.splice(pos[index], 0, curryArgs[index]);
      }
    } else {
      opargs = [].concat(
        opargs.slice.call(args, 0, pos),
        curryArgs,
        opargs.slice.call(args, pos)
      );
    }
    return opargs;
  }

  naan.curry = naan.leftCurry = naan.lcurry =
  function leftCurry(fn) {
    return curry(fn, [].slice.call(arguments, 1));
  }

  naan.rightCurry = naan.rcurry =
  function rightCurry(fn) {
    return curry(fn, [].slice.call(arguments, 1), false);
  }

  naan.curryArgs = naan.leftCurryArgs = naan.lcurrya = naan.currya =
  function curryArgs(fn, args) {
    return curry(fn, args);
  }

  naan.rightCurryArgs = naan.rcurrya =
  function rightCurryArgs(fn, args) {
    return curry(fn, args, false);
  }

  naan.positionCurry = naan.ncurry = naan.pcurry =
  function positionCurry(fn, args, pos) {
    if (!Array.isArray(args)) {
      args = [ args ];
    }
    return curry(fn, args, pos);
  }

  naan.entangleCurry = naan.ecurry = curry;
})()