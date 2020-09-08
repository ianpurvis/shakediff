// Example of es6 class inheritance wrapped in an IIFE
// rollup:  ✅ Tree-shakable
// webpack: ⚠️  Tree-shakable with a PURE annotation
// parcel:  🛑 Not tree-shakable
class Example {
}

const Other = /*@__PURE__*/ (function() {
  class Other extends Example {
  }
  return Other
})();

export { Example, Other };
