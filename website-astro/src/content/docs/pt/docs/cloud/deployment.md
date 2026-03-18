---
title: "Fazendo deploy do seu Firebase CMS e Admin UI"
slug: pt/docs/cloud/deployment
sidebar_label: Deployment
description: "Faça deploy do seu código React personalizado de CMS e painel de administração no FireCMS Cloud. Hospedagem totalmente gerenciada para o seu sistema de gerenciamento de conteúdo Firestore."
---

## Deploy no FireCMS Cloud

O FireCMS é único entre os CMSs por permitir fazer upload de código personalizado para
sua versão Cloud. Esta é uma funcionalidade muito avançada que permite personalizar
o CMS de acordo com seus requisitos.

O código é empacotado e compilado usando **module federation** e
**vite**. Isso significa que você pode usar qualquer pacote npm para construir seu CMS.
O bundle não incluirá nenhuma das dependências que já estão
incluídas no FireCMS, então você pode usar qualquer versão de qualquer pacote.

Faça deploy do seu código no [FireCMS Cloud](https://app.firecms.co) com um único comando,
e ele será servido a partir de lá:

```bash
npm run deploy
```

ou

```bash
yarn deploy
```

O benefício desta abordagem é que você pode usar qualquer pacote npm,
e pode usar a versão mais recente do FireCMS sem precisar atualizar
manualmente seu código.

### FireCMS CLI

O FireCMS CLI é uma ferramenta que permite fazer deploy do seu CMS no FireCMS Cloud
com um único comando. No seu projeto, você deve ter `firecms` como uma
dependência de desenvolvimento. Este pacote anteriormente era `@firecms/cli`.

Os comandos disponíveis são:

```bash
firecms login
```

```bash
firecms logout
```

e

```bash
firecms deploy --project=your-project-id
```

## Deployment

Os projetos do FireCMS Cloud só podem ser implantados no FireCMS Cloud.

Se você precisar de uma versão self-hosted do FireCMS, pode usar o plano PRO ou a versão community.
Como as APIs são as mesmas para todas as versões, você pode alternar facilmente entre elas.
