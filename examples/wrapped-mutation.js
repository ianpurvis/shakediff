// Example of class and prototype mutations wrapped in an IIFE
// rollup:  ✅ Tree-shakable
// webpack: ⚠️  Tree-shakable with a PURE annotation
// parcel:  🛑 Not tree-shakable
function Example() {
}

const Other = /*@__PURE__*/ (function() {
  function Other() {
  }
  Other.prototype.foo = function() { return "foo" };
  Other.prototype.bar = new String('bar');
  Other.baz = function() { return "baz" };
  Other.qux = new String('qux');
  return Other
})();

export { Example, Other };
