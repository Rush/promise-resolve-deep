'use strict';

module.exports = function setupResolveDeep(Promise) {
  var promiseMap = Promise.map || function mapImpl(promiseList, functor) {
    return Promise.all(promiseList.map(function (promiseOrValue) {
      return Promise.resolve(promiseOrValue).then(functor);
    }));
  };
  var promiseProps = Promise.props || function propsImpl(obj) {
    var promisesToResolve = [];
    Object.keys(obj).map(function (key) {
      var promise = Promise.resolve(obj[key]).then(function (val) {
        obj[key] = val;
      });
      promisesToResolve.push(promise);
    });
    return Promise.all(promisesToResolve).then(function () {
      return obj;
    });
  };

  function resolveNestedPromises(obj, options) {
    var maxDepth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 6;

    if (maxDepth === 0) {
      return Promise.resolve(obj);
    }
    maxDepth -= 1;

    return Promise.resolve(obj).then(function (obj) {
      if (Array.isArray(obj)) {
        return promiseMap(obj, function (obj) {
          return resolveNestedPromises(obj, options, maxDepth);
        }, options);
      } else if (obj && typeof obj === 'object' && obj.constructor === Object) {
        var obj2 = {};
        for (var key in obj) {
          obj2[key] = resolveNestedPromises(obj[key], options, maxDepth);
        }
        return promiseProps(obj2, options);
      }
      return obj;
    });
  };

  return Promise.resolveDeep = function (obj, options) {
    return resolveNestedPromises(obj, options);
  };
};