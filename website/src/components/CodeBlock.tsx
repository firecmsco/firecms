import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeBlockProps {
  children?: string;
  code?: string;
  language?: string;
  className?: string;
}

const languageMap: Record<string, string> = {
  js: 'javascript',
  javascript: 'javascript',
  ts: 'typescript',
  typescript: 'typescript',
  tsx: 'tsx',
  jsx: 'jsx',
  json: 'json',
  bash: 'bash',
  sh: 'bash',
  shell: 'bash',
  css: 'css',
  scss: 'scss',
  html: 'markup',
  xml: 'markup',
  md: 'markdown',
  markdown: 'markdown',
  yaml: 'yaml',
  yml: 'yaml',
  sql: 'sql',
  python: 'python',
  go: 'go',
  rust: 'rust',
  java: 'java'
};

export function CodeBlock({ children, code, language = 'javascript', className = '' }: CodeBlockProps) {
  const resolvedLanguage: string = languageMap[language?.toLowerCase?.() ?? ''] || 'javascript';
  const codeContent = children || code || '';

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-surface-950 border border-surface-800 p-6 ${className}`}>
      {resolvedLanguage && (
        <div className="absolute top-2 right-2 text-xs text-surface-500 uppercase font-mono">
          {resolvedLanguage}
        </div>
      )}
      <SyntaxHighlighter
        language={resolvedLanguage}
        style={vscDarkPlus}
        PreTag="pre"
        customStyle={{ background: 'transparent', margin: 0, padding: 0 }}
        wrapLines
        wrapLongLines
      >
        {codeContent}
      </SyntaxHighlighter>
    </div>
  );
}

export default CodeBlock;
