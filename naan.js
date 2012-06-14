(function(undefined) {
  var async, 
      root = this;

  if (typeof module !== 'undefined' && module.exports) {
    async = require('async');
  } else {
    if (root.async) {
      async = root.async;
    } else {
      throw 'Naan requires the "async" module. Get it from ' +
            'https://github.com/caolan/async.git';
    }
  }

  var bound = (function() {
    var naan = {};
    // context: the context to bind fn to
    // fn: the function to curry
    // args: the args to create a curry with
    // position: if (true|false) - true = curry args at the start of the arg list
    //                           - false = curry args at the end of the arg list
    //           if numeric, indicates the location in the args list to insert the
    //             args. if this position is great than the length of the passed args,
    //             then the args are added at the end
    function curry(context, fn, curryArgs, pos) {
      var garnisher = garnish.prepare(curryArgs, pos);
      function kitchen(fn) {
        return function curriedFunction() {
          return fn.apply(context || this, garnisher(arguments));
        };
      }

      return Array.isArray(fn) ? fn.map(kitchen) : kitchen(fn);
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
    function cook(context, fn, ingredients, recipe, callbackPosition, noParallel) {
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
            for (var index in recipe) {
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
            var result = fn.apply(
              context, 
              garnish.prepare(vegetables, recipe)(smorgasbord)
            );
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

        for (var index in pos) {
          if (index >= curryArgs.length) {
            break;
          } else if (index == pos.length - 1 && curryArgs.length > pos.length) {
            opargs.splice.apply(
              opargs, 
              [pos[index], 0].concat( curryArgs.slice(index) )
            );
          } else {
            opargs.splice(pos[index], 0, curryArgs[index]);
          }
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

    garnish.prepare = function(curryArgs, pos) {
      if (Array.isArray(pos)) {
        var index = -1;
        var sortable = curryArgs.map(function(val) {
          return {
            index: ++index >= pos.length ? pos[pos.length - 1] : pos[index],
            value: val
          };
        })
        sortable.sort(function(l, r) {
          return l.index - r.index;
        });
        curryArgs = sortable.map(function(item) {
          return item.value;
        });
        pos = pos.slice().sort();
      }

      return function(meal) {
        return garnish(meal, curryArgs, pos);
      };
    }

    naan.tupperware = naan.alwaysReturn = naan.wrap =
    function tupperware(context, fn, val) {
      return function() {
        fn.apply(context, arguments);
        return val;
      }
    }

    naan.ltupperware = naan.lalwaysReturn = naan.lwrap =
    function ltupperware(context, val, fn) {
      return tupperware(context, fn, val);
    }

    naan.curry = naan.leftCurry = naan.lcurry =
    function leftCurry(context, fn) {
      return curry(context, fn, [].slice.call(arguments, 2));
    }

    naan.rightCurry = naan.rcurry =
    function rightCurry(context, fn) {
      return curry(context, fn, [].slice.call(arguments, 2), false);
    }

    naan.curryArgs = naan.leftCurryArgs = naan.lcurrya = naan.currya =
    function curryArgs(context, fn, args) {
      return curry(context, fn, args);
    }

    naan.rightCurryArgs = naan.rcurrya =
    function rightCurryArgs(context, fn, args) {
      return curry(context, fn, args, false);
    }

    naan.positionCurry = naan.ncurry = naan.pcurry =
    function positionCurry(context, fn, args, pos) {
      if (!Array.isArray(args)) {
        args = [ args ];
      }
      return curry(context, fn, args, pos);
    }

    naan.entangleCurry = naan.ecurry = function() {
      return curry.apply(this, Array.prototype.slice.call(arguments));
    };


    return naan;
  })();

  // "zomboCrock" because it doess absolutely everything you want. And that's
  // why we don't expose it anywhere! Ok, ok, if you would like a real name, 
  // `recursiveExtendCrock` would be suitable.
  function zomboCrock(result, group, recurse, curryfn) {
    var result = result || (Array.isArray(group) ? [] : {});
    var curryargs = Array.prototype.slice.call(arguments, 4);

    if (typeof curryfn !== 'function') {
      curryargs.unshift(curryfn);
      curryfn = naan.curry;
    }

    curryargs.unshift(null);
    var memos = [], idx = 0;

    for (var key in group) {
      if ((idx = memos.indexOf(group[key])) !== -1) {
        result[key] = memos[idx];
      } else {
        if (typeof group[key] === 'object' && recurse && group[key] != null) {
          var recurseArgs = [ {}, group[key], true, curryfn ];
          recurseArgs = recurseArgs.concat(curryargs.slice(1));
          memos.push(result[key] = zomboCrock.apply(this, recurseArgs));
        } else if (typeof group[key] !== 'function') {
          result[key] = group[key];
        } else {
          curryargs[0] = group[key];
          result[key] = curryfn.apply(this, curryargs);
          memos.push(result[key]);
        }
      }
    }

    return result;
  }

  // ub = "unbound". Creates a version of naan that doesn't require a context
  // argument.
  var ub = zomboCrock({}, bound, 0, bound.curry(this, bound.curry, null), null);

  var extendCrock = ub.ncurry(zomboCrock, false, 2);
  var crock = ub.curry(extendCrock, false);
  ub.recursiveExtendCrock = ub.recursiveExtendGroupCurry = 
    ub.ncurry(zomboCrock, true, 2);
  ub.crock = ub.groupCurry = ub.group = ub.gcurry = crock; 
  ub.extendCrock = ub.ecrock = ub.egroup = ub.egcurry = extendCrock;

  ub.b = ub.bound = bound;

  ub.extendCombine = ub.ecombine = function(base, target, args, fn) {
    fn = fn || ub.curry;
    var result = base || (Array.isArray(target) ? [] : {});
    if (Array.isArray(target) && target.length !== args.length) {
      return undefined;
    }
    for (var key in target) {
      if (typeof args[key] === 'undefined') {
        continue;
      }
      var cargs = [ target[key] ].concat(args[key]);
      result[key] = fn.apply(this, cargs);
    }
    return result;
  }
  ub.combine = ub.curry(ub.ecombine, null);

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ub;
  } else {
    root.naan = ub;
  }
})()
