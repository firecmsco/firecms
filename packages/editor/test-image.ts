import { markdownParser } from './src/markdown.js';
console.log(JSON.stringify(markdownParser.parse('![alt text](src.jpg)').toJSON(), null, 2));
