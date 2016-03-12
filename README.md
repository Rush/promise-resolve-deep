## promise-resolve-deep
Resolve a promise or value and all of its embedded promises (key values, elements of array, including nested)

## Installation

```
npm install --save promise-resolve-deep
```

## Sample usage

Use it like `Proimse.resolve` and it will recursively/deep travel and resolve all nested promises in arrays and objects. Also any object or an array that any promise resolves to, will be deeply resolved too.

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

## Fun with APIs

```js
// app is express application
// User and Book are bookshelf.js models
// needs: require('promise-resolve-deep')(Promise); to install the .resolveDeep method

app.get('/resources', wrap(() => {
  return {
    users: User.fetchAll().then(users => users.map(user => user.attributes)),
    books: Book.fetchAll().then(books => books.map(book => book.attributes))
  };
}));

// utilizing Promise.resolveDeep
function wrap(func) {
  return (req, res) => {
    Promise.resolve().then(() => func())
      .then(Promise.resolveDeep).then(data => {
        res.json(data);
      }).catch(err => res.status(500));
  }
}
```
If you want to write such declarative Promise-based APIs then you may also like this: https://github.com/virtkick/express-router-api


## License

MIT
