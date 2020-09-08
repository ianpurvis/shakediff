// Example of unexported vars
// rollup:  ✅ Tree-shakable
// webpack: ⚠️  Tree-shakable with a PURE annotation
// parcel:  🛑 Not tree-shakable
function Example() {
}

const foo = new String('not pure');
const bar = /*@__PURE__*/ new String('@__PURE__');
const baz = /*#__PURE__*/ new String('#__PURE__');

function Other() {
  this.foo = foo;
  this.bar = bar;
  this.baz = baz;
}

export { Example, Other };
