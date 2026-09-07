// src/utils/visit-skip.ts
function skipFn(params) {
  const { prop, context } = params;
  return function skip({ indexPath }) {
    const paths = prop("collection").getValuePath(indexPath).slice(0, -1);
    return paths.some((value) => !context.get("expandedValue").includes(value));
  };
}
export {
  skipFn
};
