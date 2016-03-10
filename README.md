## promise-resolve-deep
Resolve a promise or value and all of its embedded promises (key values, elements of array, including nested)

## Installation

```
npm install --save promise-resolve-deep
```

## Sample usage

It can more or less be used like `Proimse.resolve` but will recursively/deep travel and resolve all nested promises.

```js
// Promise can be either native or bluebird
require('promise-resolve-deep')(Promise);

// Sample value
let promise = {
  foo: Promise.resolve({
    bar: [Promise.resolve('foo'),Promise.resolve({
      xx: Promise.resolve().then(()=>'ala')
    })]
  })
};

Promise.resolveDeep(promise).then(val => {
 // val equals to
 // { foo: {bar: ['foo', {xx: 'ala'}]}}
});
```

# License

MIT
