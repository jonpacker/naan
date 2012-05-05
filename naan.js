var async = require('async');

// fn: the function to curry
// args: the args to create a curry with
// position: if (true|false) - true = curry args at the start of the arg list
//                           - false = curry args at the end of the arg list
//           if numeric, indicates the location in the args list to insert the
//             args. if this position is great than the length of the passed args,
//             then the args are added at the end
function curry(fn, curryArgs, pos) {
  return function() {
    var opargs = [];
    if (pos === undefined || pos === true || pos <= 0) {
      opargs = curryArgs.concat(opargs.slice.call(arguments));
    } else if (pos === false || arguments.length < pos) {
      opargs = opargs.slice.call(arguments).concat(curryArgs);
    } else if (Array.isArray(pos)) {
      opargs = opargs.slice.call(arguments);
      for (index in pos) {
        opargs.splice(pos[index], 0, curryArgs[index]);
      }
    } else {
      opargs = opargs.concat(
        opargs.slice.call(arguments, 0, pos),
        curryArgs,
        opargs.slice.call(arguments, pos)
      );
    }
    return fn.apply(this, opargs);
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
//                  ingredients are added. If this is falsy or negative, it is
//                  assumed to be the last parameter in the list. If you specify
//                  this parameter you must specify `recipe` aswell.
//
// noParallel       Optional. If set to true, the `ingredients` functions are
//                  run in series, rather than parallel. If you specify this
//                  parameter you must specify `recipe` & `callbackPosition`
//                  as well.
exports.cook =
function cook(fn, ingredients, recipe, callbackPosition, noParallel) {
  var oven = noParallel ? async.series : async.parallel;
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

    if (typeof callback !== 'function') {
      return;
    }

    oven(ingredients, function(err, vegetables) {
      if (err) {
        callback(err);
      } else {
        callback(null, curry(fn, vegetables, recipe)());
      }
    });
  };
}

exports.curry = exports.leftCurry = exports.lcurry =
function leftCurry(fn) {
  return curry(fn, [].slice.call(arguments, 1));
}

exports.rightCurry = exports.rcurry =
function rightCurry(fn) {
  return curry(fn, [].slice.call(arguments, 1));
}

exports.curryArgs = exports.leftCurryArgs = exports.lcurrya = exports.currya =
function curryArgs(fn, args) {
  return curry(fn, args);
}

exports.rightCurryArgs = exports.rcurrya =
function rightCurryArgs(fn, args) {
  return curry(fn, args, false);
}

exports.positionCurry = exports.ncurry = exports.pcurry =
function positionCurry(fn, args, pos) {
  if (!Array.isArray(args)) {
    args = [ args ];
  }
  return curry(fn, args, pos);
}

exports.entangleCurry = exports.ecurry = curry;
