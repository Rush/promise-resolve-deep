'use strict';

require('chai');
let setupResolveDeep = require('./');
let assert = require('chai').assert;
let PromiseBluebird = require('bluebird');

setupResolveDeep(Promise);
setupResolveDeep(PromiseBluebird);

let checkFor = (val) => {
  return val2 => {
    assert.deepEqual(val2, val);
  };
};

let port = 44441;

function setupTests(Promise, description) {
  describe(description, function() {
    describe('Promise.resolveDeep', function() {
      function resolveTest(data, expectedData) {
        return Promise.resolveDeep(data).then(val => {
          assert.deepEqual(val, expectedData);
        });
      }
      
      it('should support embedded promise', () => {
        return resolveTest({
          foo: Promise.resolve().then(() => 'bar')
        }, {
          foo: 'bar'
        });
      });
      
      it('should support plain object', () => {
        return resolveTest({
          foo: 'bar'
        }, {
          foo: 'bar'
        });
      });
        
      it('should support direct promise', () => {
        return resolveTest(Promise.resolve({
          foo: 'bar'
        }), {
          foo: 'bar'
        });
      });
      
      it('should support embedded promise in embedded promise', () => {
        return resolveTest( Promise.resolve().then(() => ({
          foo: Promise.resolve().then(() => ({
            bar: {
              foo: Promise.resolve('test')
            }
          }))
        })), {
          foo: {bar: {foo: 'test'}}
        });
      });
      
      it('should support embedded promise array with a possible null', () => {
        return resolveTest(Promise.resolve({
          foo: Promise.resolve({
            bar: [Promise.resolve('foo'),Promise.resolve({
              xx: Promise.resolve().then(()=>'ala'),
              dd: null,
              zz: true,
              yy: false,
              mm: undefined
            })]
          })
        }), {
          foo: {bar: ['foo', {xx: 'ala', dd: null, zz: true, yy: false, mm: undefined}]}
        });
      });
    });
  });
}

setupTests(Promise, 'native Promise')
setupTests(PromiseBluebird, 'bluebird Promise')
