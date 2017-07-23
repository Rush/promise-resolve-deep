'use strict';

var setupResolveDeep = require('./index');
var PromiseBluebird = require('bluebird');

var _require = require('chai'),
    assert = _require.assert,
    expect = _require.expect;

setupResolveDeep(Promise);
setupResolveDeep(PromiseBluebird);

var checkFor = function checkFor(val) {
  return function (val2) {
    assert.deepEqual(val2, val);
  };
};

var port = 44441;

function setupTests(Promise, description) {
  describe(description, function () {
    describe('Promise.resolveDeep', function () {
      function resolveTest(data, expectedData) {
        return Promise.resolveDeep(data).then(function (val) {
          assert.deepEqual(val, expectedData);
        });
      }

      it('should support embedded promise', function () {
        return resolveTest({
          foo: Promise.resolve().then(function () {
            return 'bar';
          })
        }, {
          foo: 'bar'
        });
      });

      it('should support plain object', function () {
        return resolveTest({
          foo: 'bar'
        }, {
          foo: 'bar'
        });
      });

      it('should support direct promise', function () {
        return resolveTest(Promise.resolve({
          foo: 'bar'
        }), {
          foo: 'bar'
        });
      });

      it('should support embedded promise in embedded promise', function () {
        return resolveTest(Promise.resolve().then(function () {
          return {
            foo: Promise.resolve().then(function () {
              return {
                bar: {
                  foo: Promise.resolve('test')
                }
              };
            })
          };
        }), {
          foo: { bar: { foo: 'test' } }
        });
      });

      it('should support embedded promise array with a possible null', function () {
        return resolveTest(Promise.resolve({
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
        });
      });

      it('should not modify objects properties of they are not promises', function () {
        var obj = {
          foo: 'bar'
        };
        return Promise.resolveDeep(obj).then(function (out) {
          assert.equal(obj.foo, 'bar');
        });
      });

      it('should resolve plain object', function () {
        resolveTest(Promise.resolve({ agent_id: '2c408ef3-6a04-11e5-9a8d-0f357708d53a' }), { agent_id: '2c408ef3-6a04-11e5-9a8d-0f357708d53a' });
      });

      it('should limit recursion to 6 levels by default', function () {
        var deep7 = Promise.resolveDeep({
          a: {
            a: {
              a: {
                a: {
                  a: {
                    a: {
                      a: Promise.resolve('foo')
                    }
                  }
                }
              }
            }
          }
        });
        var deep6 = Promise.resolveDeep({
          a: {
            a: {
              a: {
                a: {
                  a: {
                    a: Promise.resolve('foo')
                  }
                }
              }
            }
          }
        });

        return Promise.all([deep6, deep7]).then(function (res) {
          expect(res[0].a.a.a.a.a.a).to.equal('foo');
          expect(res[1].a.a.a.a.a.a.a).to.be.instanceof(Promise);
        });
      });
    });
  });
}

setupTests(Promise, 'native Promise');
setupTests(PromiseBluebird, 'bluebird Promise');