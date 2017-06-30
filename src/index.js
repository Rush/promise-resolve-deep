module.exports = function setupResolveDeep(Promise) {
  const promiseMap = Promise.map || function mapImpl(promiseList, functor) {
    return Promise.all(promiseList.map(promiseOrValue =>
      Promise.resolve(promiseOrValue).then(functor)
    ));
  };
  let promiseProps = Promise.props || function propsImpl(obj) {
    var promisesToResolve = [];
    Object.keys(obj).map(key => {
      var promise = Promise.resolve(obj[key]).then(val => {
        obj[key] = val;
      });
      promisesToResolve.push(promise)
    });
    return Promise.all(promisesToResolve).then(() => obj);
  };
  
  return Promise.resolveDeep = function resolveNestedPromises(obj, options, maxDepth = 6) {
    if(maxDepth === 0) {
      return Promise.resolve(obj);
    }
    maxDepth -= 1;
    
    return Promise.resolve(obj).then(obj => {
      if(Array.isArray(obj)) {
        return promiseMap(obj, obj => resolveNestedPromises(obj, options, maxDepth), options);
      }
      else if(obj && typeof obj === 'object'  && obj.constructor === Object) {
        let obj2 = {};
        for(let key in obj) {
          obj2[key] = resolveNestedPromises(obj[key]);
        }
        return promiseProps(obj2, options);
      }
      return obj;
    });
  };
};
