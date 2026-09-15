---
slug: pt/docs/self/telemetry
title: Telemetria e verificação de licença
sidebar_label: Telemetria
description: A única requisição que um app FireCMS self-hosted envia ao FireCMS, o que ela contém, o que guardamos e por quê, e como desativá-la no Community.
---

Um app FireCMS self-hosted lê e grava seus dados direto do navegador, com o SDK do Firebase ou do MongoDB. Ao FireCMS ele envia uma única requisição: o registro de acesso, que também é a verificação da licença PRO. Esta página lista exatamente o que essa requisição contém e o que guardamos.

## Quando ela é enviada

Uma vez por usuário logado cada vez que o app carrega: quando um usuário faz login, ou quando o app abre com um usuário que já estava logado, o navegador envia uma requisição `POST` para `https://api.firecms.co/access_log`. Ela também é enviada no desenvolvimento local.

## O que a requisição contém

- **Header `Authorization`**: o ID token do usuário logado, emitido pelo seu provedor de autenticação (por exemplo, Firebase Authentication).
- **Header `Referer`**: adicionado pelo navegador; a URL da página em que o app roda.
- **Corpo**:
  - `apiKey`: sua chave de licença PRO, se você definiu uma
  - `email`: o email do usuário logado
  - `datasource`: a chave da fonte de dados em uso, por exemplo `firestore`
  - `plugins`: as chaves dos plugins que você configurou, por exemplo `["collection_editor", "user_management"]`

A requisição não contém credenciais de banco de dados, nem documentos ou outro conteúdo do Firestore ou do Atlas, nem schemas de coleções.

## O que guardamos

Nosso servidor lê o ID do projeto Firebase a partir do ID token e grava um registro por requisição, com:

- o ID do projeto Firebase e, se uma chave de licença foi enviada, o ID da licença
- o uid e o email do usuário
- os claims decodificados do ID token. Eles incluem o uid e o email, e o nome de exibição, a URL da foto e o provedor de login quando o seu provedor de autenticação os define.
- a URL do referer
- a chave da fonte de dados e as chaves dos plugins
- o resultado da verificação de licença (se os recursos PRO foram pausados)
- um timestamp

Os registros ficam no nosso projeto do Google Cloud, no Firestore e com uma cópia no BigQuery para análise de uso. O corpo da requisição, sem a chave de licença, também é gravado nos logs do nosso servidor.

## Por quê

- **Validar a licença.** Em um projeto que usa plugins PRO, a resposta diz ao app se eles funcionam ou pausam.
- **O relógio do teste.** O [teste de 30 dias em produção](/pt/docs/pro/licensing) de um projeto começa com o primeiro registro vindo de um app implantado que usa plugins PRO.
- **Medir o uso.** Quantos projetos e usuários usam o FireCMS Community e o PRO, e quais plugins.

## Emails

Quando um app implantado usa plugins PRO, também usamos o email do registro para escrever a esse usuário sobre o PRO: um email de boas-vindas na primeira vez que o projeto roda o PRO, um acompanhamento cerca de 14 dias depois e um aviso se a verificação de licença pausar os recursos PRO. Nenhum deles é enviado duas vezes para o mesmo endereço no mesmo projeto.

## Retenção

Hoje os registros são guardados sem uma data fixa de exclusão. Escreva para [hello@firecms.co](mailto:hello@firecms.co) para que os registros do seu projeto sejam excluídos.

## Desativar

Em um app sem `apiKey` e sem plugins PRO, passe `telemetry={false}` para o `FireCMS` e a requisição não é enviada:

```tsx
<FireCMS
    telemetry={false}
    navigationController={navigationController}
    authController={authController}
    dataSourceDelegate={firestoreDelegate}>
    {/* ... */}
</FireCMS>
```

Com um `apiKey` definido, ou com algum plugin PRO (editor de coleções, gestão de usuários, importação/exportação, histórico de entidades, data enhancement, DataTalk), a requisição é sempre enviada: ela é a verificação de licença e inicia o teste.

## Outras requisições ao FireCMS

Esta página cobre só o registro de acesso. Os recursos de IA opcionais (data enhancement, DataTalk e a geração de coleções com IA do editor de coleções) enviam para `api.firecms.co` os campos e prompts em que você os usa. Eles só rodam se você os adicionar ao seu app.
