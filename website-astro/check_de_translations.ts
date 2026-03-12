import { en } from './src/i18n/en';
import { de } from './src/i18n/de';

const enKeys = Object.keys(en);
const deKeys = Object.keys(de);

const missing = enKeys.filter(k => !deKeys.includes(k));
const extra = deKeys.filter(k => !enKeys.includes(k));

console.log('Missing in DE:', missing);
console.log('Extra in DE:', extra);
