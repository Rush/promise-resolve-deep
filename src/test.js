const setupResolveDeep = require('./index');
const PromiseBluebird = require('bluebird');
const {assert, expect} = require('chai');

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
      
      it('should not modify objects properties of they are not promises', () => {
        let obj = {
          foo: 'bar'
        };
        return Promise.resolveDeep(obj).then(out => {
          assert.equal(obj.foo, 'bar');
        });
      });
      
      it('should resolve plain object', () => {
        resolveTest(Promise.resolve({ agent_id: '2c408ef3-6a04-11e5-9a8d-0f357708d53a' }),
          { agent_id: '2c408ef3-6a04-11e5-9a8d-0f357708d53a' });
      });
      
      it('should limit recursion to 6 levels by default', () => {
        let deep7 = Promise.resolveDeep({
          a: {
            a: {
              a: {
                a: {
                  a: {
                    a : {
                      a: Promise.resolve('foo')
                    }
                  }
                }
              }
            }
          }
        });
        let deep6 = Promise.resolveDeep({
          a: {
            a: {
              a: {
                a: {
                  a: {
                    a : Promise.resolve('foo')
                  }
                }
              }
            }
          }
        });
        
        return Promise.all([deep6, deep7]).then(res => {
          expect(res[0].a.a.a.a.a.a).to.equal('foo');
          expect(res[1].a.a.a.a.a.a.a).to.be.instanceof(Promise);
        });
      });
    });
  });
}

setupTests(Promise, 'native Promise')
setupTests(PromiseBluebird, 'bluebird Promise')
