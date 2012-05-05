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
    } else if (arguments.length < position || pos === false) {
      opargs = opargs.slice.call(arguments).concat(curryArgs);
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
