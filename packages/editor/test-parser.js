import { markdownParser } from './dist/index.es.js';
console.log(markdownParser.parse('- [ ] test <b>html</b>').toJSON());
