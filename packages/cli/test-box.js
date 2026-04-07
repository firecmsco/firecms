const { cyan, white } = require("chalk");

console.log(cyan("┌────────────────────────────────────────────────────────────┐"));
console.log(cyan("│                                                            │"));
console.log(cyan("│   ✨ Rebase Admin App is ready!                            │"));
const cleanUrl = "http://localhost:5173";
console.log(cyan(`│   👉 Frontend URL: `) + white(cleanUrl.padEnd(40)) + cyan(`│`));
console.log(cyan("│                                                            │"));
console.log(cyan("└────────────────────────────────────────────────────────────┘"));
