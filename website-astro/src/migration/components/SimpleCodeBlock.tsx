import React from "react";
import { Highlight, themes } from "prism-react-renderer";
import clsx from "clsx";

export interface SimpleCodeBlockProps {
  code: string;
  language: string;
  className?: string;
  showHeader?: boolean;
}

/** Lightweight replacement for Docusaurus CodeBlock */
export function SimpleCodeBlock({ code, language, className, showHeader = true }: SimpleCodeBlockProps) {
  const isDark = true;
  const theme = isDark ? themes.vsDark : themes.github;
  return (
    <div className={clsx("rounded-md overflow-hidden text-sm border", isDark ? "bg-gray-900 border-gray-700" : "bg-gray-100 border-gray-200", className)}>
      {showHeader && (
        <div className={clsx("px-3 py-1.5 text-[11px] font-mono uppercase tracking-wide flex items-center gap-2 select-none", isDark ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-700")}>
          <span>{language}</span>
        </div>
      )}
      <Highlight code={code.trim()} language={language as any} theme={theme}>
        {({ className: inner, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={clsx(inner, "m-0 px-4 py-3 overflow-x-auto leading-relaxed text-[13px]", isDark ? "text-gray-200" : "text-gray-800")} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}

export default SimpleCodeBlock;

