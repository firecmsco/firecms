---
title: Potenciado por MDX
slug: es/docs/mdx
---

Puedes escribir JSX y usar componentes de React dentro de tu Markdown gracias a [MDX](https://mdxjs.com/).

export const Highlight = ({children, color}) => ( <span style={{
      backgroundColor: color,
      borderRadius: '2px',
      color: '#fff',
      padding: '0.2rem',
    }}>{children}</span> );

<Highlight color="#25c2a0">Verde Docusaurus</Highlight> y <Highlight color="#1877F2">Azul Facebook</Highlight> son mis colores favoritos.

¡Puedo escribir **Markdown** junto con mi _JSX_!
