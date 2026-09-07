// src/prop-types.ts
function createNormalizer(fn) {
  return new Proxy({}, {
    get(_target, key) {
      if (key === "style")
        return (props) => {
          return fn({ style: props }).style;
        };
      return fn;
    }
  });
}
export {
  createNormalizer
};
