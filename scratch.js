const values = { a: 1, b: 2, c: 3 };
const entries = Object.entries(values).sort(([a], [b]) => Number(a) - Number(b));
console.log(entries);
