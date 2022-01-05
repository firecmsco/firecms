export const sameProps = (oldProps: any, newProps: any, props: string[]) =>
  props.find((p) => oldProps[p] !== newProps[p]) === undefined;
