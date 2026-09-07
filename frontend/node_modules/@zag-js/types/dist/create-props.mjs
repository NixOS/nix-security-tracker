// src/create-props.ts
var createProps = () => (props) => Array.from(new Set(props));
export {
  createProps
};
