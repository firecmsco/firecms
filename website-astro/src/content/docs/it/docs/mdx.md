---
title: Compatibile con MDX
slug: it/docs/mdx
---

Puoi scrivere JSX e usare componenti React nel tuo Markdown grazie a [MDX](https://mdxjs.com/).

export const Highlight = ({children, color}) => ( <span style={{
      backgroundColor: color,
      borderRadius: '2px',
      color: '#fff',
      padding: '0.2rem',
    }}>{children}</span> );

<Highlight color="#25c2a0">Docusaurus green</Highlight> e <Highlight color="#1877F2">Facebook blue</Highlight> sono i miei colori preferiti.

Posso scrivere **Markdown** insieme al mio _JSX_!
