// Example of inheritance wrapped in an IIFE
// rollup:  ✅ Tree-shakable
// webpack: ⚠️  Tree-shakable with a PURE annotation
// parcel:  🛑 Not tree-shakable
function Example() {
}

const Other = /*@__PURE__*/ (function() {
  function Other() {
    Example.call(this);
  }
  Other.prototype = Object.create(Example.prototype);
  Other.prototype.constructor = Other;
  return Other
})();

export { Example, Other };
