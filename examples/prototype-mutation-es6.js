// Example of mutating an es6 class prototype
// rollup:  ✅ Tree-shakable
// webpack: 🛑 Not tree-shakable
// parcel:  🛑 Not tree-shakable
class Example {
}

class Other {
}
Other.prototype.foo = function() { return "foo" };
Other.prototype.bar = new String('bar');
Other.prototype.baz = /*@__PURE__*/ new String('@__PURE__');
Other.prototype.qux = /*#__PURE__*/ new String('#__PURE__');

export { Example, Other };
