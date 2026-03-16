/**
 * Language mismatch detector for Astro site docs and i18n files.
 * 
 * Strategy:
 * 1. For doc files (.md/.mdx): extract body text (skip frontmatter and code blocks),
 *    then use language-specific word frequency analysis to detect the likely language.
 * 2. For i18n .ts files: parse translation values and check for wrong-language content.
 * 3. Compare slug prefixes in frontmatter to ensure they match the folder locale.
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, extname, relative, basename } from 'path';

const DOCS_BASE = '/Users/francesco/firecms/website-astro/src/content/docs';
const I18N_DIR = '/Users/francesco/firecms/website-astro/src/i18n';

// Map folder names to expected languages
const LOCALE_MAP = {
  'docs': 'en',  // English is in the 'docs' subfolder
  'de': 'de',
  'es': 'es',
  'fr': 'fr',
  'it': 'it',
  'pt': 'pt',
};

// High-frequency words that are strong indicators of a specific language.
// These are common words that appear in prose (not in technical content).
const LANG_INDICATORS = {
  en: [
    'the', 'and', 'you', 'your', 'with', 'that', 'this', 'for', 'are', 'from',
    'can', 'will', 'have', 'has', 'not', 'but', 'all', 'they', 'what', 'when',
    'how', 'which', 'their', 'more', 'also', 'been', 'into', 'other', 'than',
    'then', 'these', 'about', 'would', 'make', 'like', 'just', 'should',
    'each', 'such', 'here', 'between', 'need', 'does', 'provide', 'without',
    'using', 'where', 'only', 'after', 'before', 'follow', 'within',
  ],
  de: [
    'und', 'der', 'die', 'das', 'ist', 'ein', 'eine', 'nicht', 'mit', 'auf',
    'den', 'dem', 'des', 'sich', 'von', 'für', 'sind', 'auch', 'als', 'wird',
    'bei', 'oder', 'nach', 'wie', 'kann', 'aus', 'wenn', 'nur', 'über', 'aber',
    'hat', 'noch', 'werden', 'können', 'diese', 'haben', 'einem', 'einer',
    'mehr', 'dann', 'hier', 'ihre', 'ohne', 'unter', 'durch', 'seine',
    'wurde', 'zum', 'zur', 'vor', 'zwischen', 'bereits', 'dabei',
    'verwendet', 'können', 'erstellen', 'hinzufügen', 'beispiel',
  ],
  es: [
    'que', 'los', 'por', 'con', 'una', 'las', 'del', 'para', 'más', 'pero',
    'como', 'está', 'son', 'este', 'todo', 'también', 'puede', 'entre', 'cuando',
    'muy', 'sin', 'sobre', 'ser', 'tiene', 'hasta', 'desde', 'donde', 'después',
    'sus', 'hay', 'todos', 'esta', 'sido', 'tienen', 'otro', 'otros', 'otra',
    'pueden', 'hacer', 'cada', 'estos', 'aquí', 'ejemplo', 'solo',
    'configuración', 'permite', 'utilizar', 'datos', 'crear',
  ],
  fr: [
    'les', 'des', 'une', 'est', 'que', 'pas', 'pour', 'sur', 'dans', 'qui',
    'par', 'plus', 'avec', 'son', 'tout', 'peut', 'ses', 'mais', 'comme',
    'cette', 'aux', 'ont', 'fait', 'même', 'sans', 'aussi', 'après',
    'entre', 'sous', 'vous', 'votre', 'être', 'lors', 'avoir', 'tous',
    'elle', 'très', 'nous', 'ces', 'leur', 'encore', 'sont', 'dont',
    'puis', 'chaque', 'exemple', 'permet', 'utiliser', 'données', 'créer',
    'configurer', 'personnaliser', 'pouvez', 'définir',
  ],
  it: [
    'che', 'per', 'con', 'una', 'del', 'della', 'delle', 'dei', 'degli',
    'sono', 'questo', 'questa', 'anche', 'come', 'più', 'può', 'suo', 'suoi',
    'sua', 'dal', 'dalla', 'nel', 'nella', 'tra', 'tra', 'dopo', 'ogni',
    'senza', 'ancora', 'fino', 'tutti', 'tutto', 'già', 'dove', 'quando',
    'essere', 'fare', 'hai', 'puoi', 'esempio', 'dati', 'creare',
    'configurare', 'personalizzare', 'utilizzare', 'definire', 'proprietà',
    'seguente', 'seguenti', 'tuo', 'tua', 'tuoi', 'tue',
  ],
  pt: [
    'que', 'dos', 'das', 'com', 'uma', 'para', 'são', 'não', 'por', 'mais',
    'como', 'mas', 'também', 'pode', 'seu', 'sua', 'seus', 'suas', 'este',
    'esta', 'pelo', 'pela', 'entre', 'quando', 'muito', 'sem', 'sobre',
    'após', 'todos', 'cada', 'ainda', 'onde', 'fazer', 'você', 'exemplo',
    'dados', 'criar', 'configurar', 'personalizar', 'utilizar', 'definir',
    'permite', 'propriedade', 'seguinte', 'seguintes',
  ],
};

// Words that appear in multiple romance languages - reduce their weight  
const AMBIGUOUS_WORDS = new Set([
  'que', 'para', 'como', 'con', 'una', 'son', 'puede', 'entre', 'todo',
  'pode', 'exemplo', 'exemplo',
]);

/**
 * Recursively get all .md/.mdx files
 */
async function getFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'api' || entry.name === 'samples') continue; // skip API docs and samples
      files.push(...await getFiles(fullPath));
    } else if (['.md', '.mdx'].includes(extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Extract body text from a markdown file, removing frontmatter and code blocks
 */
function extractBodyText(content) {
  // Remove frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  let body = fmMatch ? fmMatch[2] : content;
  
  // Remove code blocks (``` ... ```)
  body = body.replace(/```[\s\S]*?```/g, '');
  
  // Remove inline code
  body = body.replace(/`[^`]+`/g, '');
  
  // Remove HTML tags
  body = body.replace(/<[^>]+>/g, ' ');
  
  // Remove markdown links URLs but keep text  
  body = body.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  
  // Remove admonition markers
  body = body.replace(/:::\w+/g, '');
  body = body.replace(/:::/g, '');
  
  // Remove import statements
  body = body.replace(/^import\s+.*$/gm, '');
  
  // Remove URLs
  body = body.replace(/https?:\/\/\S+/g, '');
  
  // Remove markdown formatting
  body = body.replace(/[#*_\[\](){}|>]/g, ' ');
  
  return body;
}

/**
 * Extract frontmatter as an object
 */
function extractFrontmatter(content) {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return {};
  const fm = {};
  const lines = fmMatch[1].split('\n');
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      fm[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  }
  return fm;
}

/**
 * Detect the language of a text based on word frequency analysis
 * Returns an object with language scores
 */
function detectLanguage(text) {
  const words = text.toLowerCase()
    .replace(/[^a-záàâãäåéèêëíìîïóòôõöúùûüñçß\-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1);
  
  if (words.length < 10) {
    return { detected: 'unknown', scores: {}, wordCount: words.length, confidence: 0 };
  }
  
  const wordSet = {};
  for (const w of words) {
    wordSet[w] = (wordSet[w] || 0) + 1;
  }
  
  const scores = {};
  for (const [lang, indicators] of Object.entries(LANG_INDICATORS)) {
    let score = 0;
    let matchedWords = [];
    for (const indicator of indicators) {
      if (wordSet[indicator]) {
        const weight = AMBIGUOUS_WORDS.has(indicator) ? 0.3 : 1;
        score += wordSet[indicator] * weight;
        matchedWords.push(`${indicator}(${wordSet[indicator]})`);
      }
    }
    // Normalize by word count to make scores comparable
    scores[lang] = {
      raw: score,
      normalized: score / words.length,
      matchedWords: matchedWords.slice(0, 10),
    };
  }
  
  // Find the top language
  const sorted = Object.entries(scores).sort((a, b) => b[1].normalized - a[1].normalized);
  const topLang = sorted[0][0];
  const topScore = sorted[0][1].normalized;
  const secondScore = sorted.length > 1 ? sorted[1][1].normalized : 0;
  
  // Confidence: ratio between top and second
  const confidence = secondScore > 0 ? topScore / secondScore : (topScore > 0 ? 10 : 0);
  
  return { 
    detected: topLang, 
    scores, 
    wordCount: words.length, 
    confidence,
    topTwo: sorted.slice(0, 2).map(([l, s]) => `${l}:${s.normalized.toFixed(3)}`)
  };
}

/**
 * Check if a slug matches the expected locale
 */
function checkSlug(slug, expectedLocale) {
  if (!slug) return null;
  if (expectedLocale === 'en') {
    // English docs should have slugs starting with 'docs/'
    if (slug.startsWith('docs/') || slug === 'docs') return null;
    // Check if it starts with another locale
    for (const loc of ['de', 'es', 'fr', 'it', 'pt']) {
      if (slug.startsWith(loc + '/')) return `Slug starts with '${loc}/' instead of 'docs/'`;
    }
    return null;
  }
  // Non-English docs should have slugs starting with their locale
  if (slug.startsWith(expectedLocale + '/')) return null;
  // Check if slug starts with a different locale
  for (const loc of ['de', 'es', 'fr', 'it', 'pt', 'docs']) {
    if (slug.startsWith(loc + '/') || slug.startsWith(loc)) {
      const locName = loc === 'docs' ? 'en' : loc;
      if (locName !== expectedLocale) {
        return `Slug starts with '${loc}/' but expected '${expectedLocale}/'`;
      }
    }
  }
  return null;
}

// ===== MAIN =====
async function main() {
  const issues = [];
  
  console.log('=== Scanning documentation files for language mismatches ===\n');
  
  // Process each locale folder
  for (const [folder, expectedLang] of Object.entries(LOCALE_MAP)) {
    const folderPath = join(DOCS_BASE, folder);
    
    try {
      await stat(folderPath);
    } catch {
      console.log(`Skipping ${folder}: directory does not exist`);
      continue;
    }
    
    const files = await getFiles(folderPath);
    console.log(`Processing ${folder}/ (${expectedLang}): ${files.length} files`);
    
    for (const filePath of files) {
      const relPath = relative(DOCS_BASE, filePath);
      const content = await readFile(filePath, 'utf-8');
      const frontmatter = extractFrontmatter(content);
      const bodyText = extractBodyText(content);
      
      // 1. Check slug
      if (frontmatter.slug) {
        const slugIssue = checkSlug(frontmatter.slug, expectedLang);
        if (slugIssue) {
          issues.push({
            file: relPath,
            type: 'SLUG_MISMATCH',
            expected: expectedLang,
            detail: slugIssue,
            slug: frontmatter.slug,
          });
        }
      }
      
      // 2. Detect body language
      const detection = detectLanguage(bodyText);
      
      if (detection.detected !== 'unknown' && detection.detected !== expectedLang) {
        // Only flag if confidence is reasonable (top language clearly ahead)
        if (detection.confidence > 1.3 || (detection.scores[expectedLang]?.normalized || 0) < 0.01) {
          issues.push({
            file: relPath,
            type: 'LANGUAGE_MISMATCH',
            expected: expectedLang,
            detected: detection.detected,
            confidence: detection.confidence.toFixed(2),
            wordCount: detection.wordCount,
            topTwo: detection.topTwo,
            detail: `Expected ${expectedLang} but detected ${detection.detected} (confidence: ${detection.confidence.toFixed(2)})`,
          });
        }
      }
      
      // 3. Check if body is identical to English (not translated)
      if (expectedLang !== 'en') {
        const enFilePath = filePath.replace(`/${folder}/`, '/docs/');
        try {
          const enContent = await readFile(enFilePath, 'utf-8');
          const enBody = extractBodyText(enContent);
          
          // Normalize whitespace for comparison
          const normalizedBody = bodyText.replace(/\s+/g, ' ').trim();
          const normalizedEnBody = enBody.replace(/\s+/g, ' ').trim();
          
          if (normalizedBody.length > 50 && normalizedBody === normalizedEnBody) {
            issues.push({
              file: relPath,
              type: 'UNTRANSLATED',
              expected: expectedLang,
              detected: 'en',
              detail: `Body content is identical to English version (not translated)`,
            });
          }
        } catch {
          // English file doesn't exist, that's fine
        }
      }
    }
  }
  
  // ===== Check i18n .ts files =====
  console.log('\n=== Scanning i18n translation files ===\n');
  
  for (const lang of ['de', 'es', 'fr', 'it', 'pt']) {
    const tsPath = join(I18N_DIR, `${lang}.ts`);
    try {
      const content = await readFile(tsPath, 'utf-8');
      
      // Extract all string values from the TS file
      const valueRegex = /['"]([^'"]+)['"]\s*:\s*['"`]([\s\S]*?)['"`]\s*[,}]/g;
      let match;
      while ((match = valueRegex.exec(content)) !== null) {
        const key = match[1];
        const value = match[2];
        
        // Skip very short values, URLs, code-like values, HTML
        if (value.length < 20) continue;
        if (value.includes('http') || value.includes('@') || value.includes('npm')) continue;
        if (value.match(/^[A-Z0-9_/.\-]+$/)) continue;
        
        // Detect language of the value
        const detection = detectLanguage(value);
        
        if (detection.detected !== 'unknown' && detection.detected !== lang && detection.confidence > 1.5) {
          // Double-check: is it clearly NOT the expected language?
          const expectedScore = detection.scores[lang]?.normalized || 0;
          const detectedScore = detection.scores[detection.detected]?.normalized || 0;
          
          if (detectedScore > expectedScore * 1.5 && detection.wordCount > 5) {
            issues.push({
              file: `i18n/${lang}.ts`,
              type: 'I18N_MISMATCH',
              expected: lang,
              detected: detection.detected,
              key: key,
              confidence: detection.confidence.toFixed(2),
              detail: `Key "${key}" appears to be in ${detection.detected} instead of ${lang}`,
              value: value.substring(0, 100),
            });
          }
        }
      }
    } catch (e) {
      console.log(`Could not read ${tsPath}: ${e.message}`);
    }
  }
  
  // ===== Output results =====
  console.log('\n========================================');
  console.log(`Found ${issues.length} potential issues`);
  console.log('========================================\n');
  
  // Group by type
  const byType = {};
  for (const issue of issues) {
    if (!byType[issue.type]) byType[issue.type] = [];
    byType[issue.type].push(issue);
  }
  
  for (const [type, typeIssues] of Object.entries(byType)) {
    console.log(`\n--- ${type} (${typeIssues.length} issues) ---\n`);
    for (const issue of typeIssues) {
      console.log(`  File: ${issue.file}`);
      console.log(`  Detail: ${issue.detail}`);
      if (issue.key) console.log(`  Key: ${issue.key}`);
      if (issue.value) console.log(`  Value: ${issue.value}`);
      if (issue.topTwo) console.log(`  Scores: ${issue.topTwo.join(', ')}`);
      if (issue.slug) console.log(`  Slug: ${issue.slug}`);
      console.log('');
    }
  }
  
  // Also output as JSON for easy processing
  const jsonPath = '/tmp/language_mismatch_report.json';
  const { writeFile } = await import('fs/promises');
  await writeFile(jsonPath, JSON.stringify(issues, null, 2));
  console.log(`\nDetailed JSON report saved to: ${jsonPath}`);
}

main().catch(console.error);
