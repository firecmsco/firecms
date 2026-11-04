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

## Importando o Firebase no seu código

O FireCMS Cloud fornece o React, os pacotes do FireCMS e o SDK do Firebase ao seu código, então o
seu build não inclui nenhuma cópia deles. São os pacotes listados em `shared` no seu
`vite.config.ts`, e apenas os imports que nomeiam exatamente um deles recebem a cópia do FireCMS.

Para o Firebase, isso significa importar dos pacotes `@firebase/…`, não dos pontos de entrada
`firebase/…`:

```ts
// Não: o build aponta para um arquivo que ele nunca gera
import { getFunctions, httpsCallable } from "firebase/functions";

// Sim
import { getApp } from "@firebase/app";
import { getFunctions, httpsCallable } from "@firebase/functions";
```

O mesmo vale para `@firebase/firestore`, `@firebase/auth`, `@firebase/storage`,
`@firebase/analytics`, `@firebase/remote-config` e `@firebase/app-check`. Eles são instalados junto
com o `firebase`; se o seu gerenciador de pacotes não os instala no nível superior (o pnpm, por
exemplo), adicione ao seu `package.json` os que você importa.

`getApp()` retorna o app Firebase do seu projeto, o que o FireCMS usa. O FireCMS pode ainda não tê-lo
inicializado quando o seu código é carregado, então chame `getApp()`, `getFunctions()`,
`getFirestore()` e afins quando o seu código for executado, dentro de um componente ou de um
callback, não no nível superior de um arquivo.

## Solução de problemas

### "Error loading remote config"

O FireCMS mostra esta mensagem quando não consegue carregar ou executar o código que você implantou.
Abra o console do navegador para ver o motivo:

- **Um 404 em um arquivo chamado `__federation_shared_…`**, muitas vezes seguido de uma mensagem
  sobre um tipo MIME não permitido (`application/json`): o seu código importa um pacote compartilhado
  por outro caminho, geralmente `firebase/…` em vez de `@firebase/…`. Veja
  [Importando o Firebase no seu código](#importando-o-firebase-no-seu-código). Versões mais recentes do `firecms deploy` detectam
  isso antes do envio e indicam os imports a mudar.
- **Uma exceção do seu próprio código**: algo falhou enquanto a sua configuração era carregada, por
  exemplo uma chamada a `getFirestore()` no nível superior de um arquivo antes de o Firebase estar
  inicializado. O stack trace aponta onde.

A ausência de arquivos `__federation_shared_…` em `dist/assets` é esperada, não um sinal de build
quebrado: o FireCMS fornece esses pacotes, então o build não os inclui.

### Um 404 em `material-icons-….woff2`

Se o console mostrar um 404 para `/assets/material-icons-….woff2` em `api.firecms.co`, os ícones do
seu código podem não aparecer. O seu `vite.config.ts` é anterior à correção das URLs de fontes do
template: copie o bloco `experimental.renderBuiltUrl` do
[`vite.config.ts` do template do FireCMS Cloud](https://github.com/firecmsco/firecms/blob/main/packages/cli/templates/template_cloud/vite.config.ts) para o seu, e faça o build e o deploy de
novo.

## Deployment

Os projetos do FireCMS Cloud só podem ser implantados no FireCMS Cloud.

Se você precisar de uma versão self-hosted do FireCMS, pode usar o plano PRO ou a versão community.
Como as APIs são as mesmas para todas as versões, você pode alternar facilmente entre elas.
