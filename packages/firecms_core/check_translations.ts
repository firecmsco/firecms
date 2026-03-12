import { en } from './src/locales/en';
import { es } from './src/locales/es';

const enKeys = Object.keys(en);
const esKeys = Object.keys(es);

const missingInEs = enKeys.filter(key => !(key in es));
const missingInEn = esKeys.filter(key => !(key in en));

console.log("Keys missing in ES (present in EN):", missingInEs);
console.log("Keys missing in EN (present in ES):", missingInEn);
