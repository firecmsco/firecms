---
title: Unterstützt von MDX
---

Sie können JSX schreiben und React-Komponenten in Ihrem Markdown dank [MDX](https://mdxjs.com/) verwenden.

export const Highlight = ({children, color}) => ( <span style={{
      backgroundColor: color,
      borderRadius: '2px',
      color: '#fff',
      padding: '0.2rem',
    }}>{children}</span> );

<Highlight color="#25c2a0">Docusaurus Grün</Highlight> und <Highlight color="#1877F2">Facebook Blau</Highlight> sind meine Lieblingsfarben.

Ich kann **Markdown** zusammen mit meinem _JSX_ schreiben!
