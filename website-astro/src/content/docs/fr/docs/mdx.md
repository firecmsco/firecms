---
slug: fr/docs/mdx
title: Propulsé par MDX
---

Vous pouvez écrire du JSX et utiliser des composants React dans votre Markdown grâce à [MDX](https://mdxjs.com/).

export const Highlight = ({children, color}) => ( <span style={{
      backgroundColor: color,
      borderRadius: '2px',
      color: '#fff',
      padding: '0.2rem',
    }}>{children}</span> );

<Highlight color="#25c2a0">Vert Docusaurus</Highlight> et <Highlight color="#1877F2">Bleu Facebook</Highlight> sont mes couleurs préférées.

Je peux écrire du **Markdown** avec mon _JSX_ !
