'use strict';

var Benchmark = require('benchmark');

function testPromise(label, Promise) {
  require('./index')(Promise);

  var suite = new Benchmark.Suite();
  suite.add(label + '#resolveDeep', function (deferred) {
    Promise.resolveDeep(Promise.resolve({
      foo: Promise.resolve({
        bar: [Promise.resolve('foo'), Promise.resolve({
          xx: Promise.resolve().then(function () {
            return 'ala';
          }),
          dd: null,
          zz: true,
          yy: false,
          mm: undefined
        })]
      })
    }), {
      foo: { bar: ['foo', { xx: 'ala', dd: null, zz: true, yy: false, mm: undefined }] }
    }).then(function () {
      return deferred.resolve();
    });
  }, { defer: true })
  // add listeners
  .on('cycle', function (event) {
    console.log(String(event.target));
  }).on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  // run async
  .run({ 'async': true });
}

testPromise('bluebird', require('bluebird'));
testPromise('default', Promise);