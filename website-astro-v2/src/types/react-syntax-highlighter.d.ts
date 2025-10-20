declare module 'react-syntax-highlighter' {
  import * as React from 'react';
  export interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    PreTag?: any;
    customStyle?: React.CSSProperties;
    wrapLines?: boolean;
    wrapLongLines?: boolean;
    children?: React.ReactNode;
  }
  export const Prism: React.ComponentType<SyntaxHighlighterProps>;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const vscDarkPlus: any;
  const others: any;
  export default others;
}

