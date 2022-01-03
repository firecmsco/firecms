export const noop = () => {};
export const range = n => Array.from({
  length: n
}, (v, i) => i);
export const between = (min, max, number) => Math.min(max, Math.max(min, number));
export const oneOf = (a, b) => typeof a !== 'undefined' ? a : b;