// Example of mutating a class prototype
// rollup:  ✅ Tree-shakable
// webpack: 🛑 Not tree-shakable
// parcel:  🛑 Not tree-shakable
function Example() {
}

function Other() {
}
Other.prototype.foo = function() { return "foo" };
Other.prototype.bar = new String('bar');
Other.prototype.baz = /*@__PURE__*/ new String('@__PURE__');
Other.prototype.qux = /*#__PURE__*/ new String('#__PURE__');

export { Example, Other };
