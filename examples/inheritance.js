// Example of inheritance
// rollup:  ✅ Tree-shakable
// webpack: 🛑 Not tree-shakable
// parcel:  🛑 Not tree-shakable
function Example() {
}

function Other() {
  Example.call(this);
}
Other.prototype = Object.create(Example.prototype);
Other.prototype.constructor = Other;

export { Example, Other };
