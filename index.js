'use strict';

module.exports = function setupResolveDeep(Promise) {
  var promiseMap = Promise.map || function mapImpl(promiseList, functor) {
    return Promise.all(promiseList.map(promiseOrValue =>
      Promise.resolve(promiseOrValue).then(functor)
    ));
  };
  var promiseProps = Promise.props || function propsImpl(obj) {
    var promisesToResolve = [];
    Object.keys(obj).map(key => {
      var promise = Promise.resolve(obj[key]).then(val => {
        obj[key] = val;
      });
      promisesToResolve.push(promise)
    });
    return Promise.all(promisesToResolve).then(() => obj);
  };
  
  return Promise.resolveDeep = function resolveNestedPromises(obj) {
    return Promise.resolve(obj).then(obj => {
      if(Array.isArray(obj)) {
        return promiseMap(obj, resolveNestedPromises);
      }
      else if(obj && typeof obj === 'object'  && obj.constructor === Object) {
        var obj2 = {};
        for(var key in obj) {
          obj2[key] = resolveNestedPromises(obj[key]);
        }
        return promiseProps(obj2);
      }
      return obj;
    });
  };
};
