---
slug: pt/docs/mdx
title: MDX e componentes personalizados
---

O FireCMS fornece suporte para **MDX**, permitindo que você use componentes React
na sua documentação e páginas de conteúdo.

O MDX é um formato que combina Markdown com JSX, permitindo importar e usar
componentes React interativos diretamente nos seus documentos Markdown. Isto é
particularmente útil para criar documentação rica e interativa.

```mdx
import { Chart } from './Chart'

# Minha Página

Aqui está um gráfico interativo:

<Chart />
```

Pode usar MDX em qualquer lugar onde Markdown é suportado no FireCMS.
