// Example of mutating a class
// rollup:  ✅ Tree-shakable
// webpack: 🛑 Not tree-shakable
// parcel:  ✅ Tree-shakable
function Example() {
}

function Other() {
}
Other.foo = function() { return "foo" };
Other.bar = new String('bar');
Other.baz = /*@__PURE__*/ new String('@__PURE__');
Other.qux = /*#__PURE__*/ new String('#__PURE__');

export { Example, Other };
