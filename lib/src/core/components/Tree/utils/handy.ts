export const noop = () => {};

export const range = (n: number): Array<number> =>
  Array.from({ length: n }, (v, i) => i);

export const between = (min: number, max: number, number: number) =>
  Math.min(max, Math.max(min, number));

export const oneOf = <T>(a: T, b: T): T => (typeof a !== 'undefined' ? a : b);
