import { markdownParser } from './src/markdown.js'; // or .ts
console.log(JSON.stringify(markdownParser.parse('- [ ] test <b>html</b>').toJSON(), null, 2));
