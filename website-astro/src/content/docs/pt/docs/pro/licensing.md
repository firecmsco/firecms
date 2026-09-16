---
title: Licenças
slug: pt/docs/pro/licensing
description: Preços do FireCMS PRO, o teste de 30 dias em produção, o que pausa sem licença e como configurar sua chave de licença.
---

:::tip
Tem perguntas ou precisa de uma licença personalizada?
[Entre em contato por email](mailto:hello@firecms.co),
ou [agende uma chamada](https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0INW8ihjQ90S4gkdo8_rbL_Zx7gagZShLIpHyW43zDXkQDPole6a1coo1sT2O6Gl05X8lxFDlp?gv=true).
:::

## Preço

O FireCMS PRO custa **€99 por mês pelo primeiro projeto** e **€49 por mês por cada projeto adicional** na mesma licença.

| | Mensal | Anual |
|---|---|---|
| Primeiro projeto | €99 ($119) | €990 ($1.190) |
| Cada projeto adicional | €49 ($59) | €490 ($590) |

- **A unidade é um projeto Firebase.** Todo projeto vinculado a uma licença conta igual. Não há diferença entre desenvolvimento, staging e produção: um app com projetos Firebase separados para dev, staging e prod são três projetos.
- **Usuários ilimitados.** Adicione a cada projeto quantos usuários precisar.
- **Todos os seus projetos em uma única licença.** O valor de €49 vale para projetos na mesma licença, então uma licença sai mais barata que várias. Prod e staging em uma licença custam €99 + €49 = €148 por mês. Cinco projetos de clientes em uma licença custam €99 + 4 × €49 = €295 por mês; em cinco licenças separadas custariam €495.

## Teste gratuito de 30 dias

O PRO é grátis por **30 dias em produção**. Para começar, você não precisa de cartão nem de chave de licença.

O teste de um projeto Firebase começa na primeira vez que um app implantado, ou seja, qualquer app que não seja servido a partir de `localhost`, `127.0.0.1` ou `[::1]`, executa um plugin PRO com esse projeto. O desenvolvimento local nunca precisa de licença.

## O que acontece quando o teste termina

Se um projeto não tiver uma licença válida quando o teste terminar, ou quando a licença expirar, estes recursos PRO pausam:

- o editor de coleções (editor de schema)
- importação e exportação
- o histórico de entidades
- data enhancement (preenchimento automático com IA)
- DataTalk

O app continua funcionando. O login, seus dados, as coleções definidas no código e as coleções salvas com o editor de schema continuam carregando e podem ser editadas. A gestão de usuários continua cuidando do login e dos papéis, mas as telas de Usuários e Papéis mostram um aviso de que estão pausadas. Um banner no app leva à página onde você obtém uma licença. Assim que o projeto estiver em uma licença ativa, os recursos pausados voltam na próxima vez que o app carregar.

Uma licença cobre tantos projetos em produção quanto paga. Se mais projetos dela rodarem em produção, os que entraram no ar primeiro mantêm o PRO e, nos demais, o PRO fica em pausa, como descrito acima, até que a licença pague por eles. O desenvolvimento local nunca conta.

## Plugins que precisam de licença

| Plugin | Pacote |
|---|---|
| Editor de coleções | `@firecms/collection_editor` |
| Gestão de usuários | `@firecms/user_management` |
| Importação e exportação | `@firecms/data_import`, `@firecms/data_export`, `@firecms/data_import_export` |
| Histórico de entidades | `@firecms/entity_history` |
| Data enhancement | `@firecms/data_enhancement` |
| DataTalk | `@firecms/datatalk` |

O gerenciador de mídia, o plugin de administração do Firebase e os seus próprios plugins não precisam de licença. Um app que não usa nenhum dos plugins acima é o FireCMS Community, grátis sob a licença MIT.

## Obtenha uma licença e configure a chave

1. Acesse [app.firecms.co/subscriptions](https://app.firecms.co/subscriptions?intent=pro) e faça login.
2. Crie uma licença PRO e adicione o ID de cada projeto Firebase que ela deve cobrir. O ID de um projeto fica no console do Firebase, em **Configurações do projeto**.
3. Copie a chave de licença e passe-a ao componente `FireCMS` como `apiKey`:

```tsx
<FireCMS
    apiKey={import.meta.env.VITE_FIRECMS_API_KEY}
    navigationController={navigationController}
    authController={authController}
    dataSourceDelegate={firestoreDelegate}
    plugins={plugins}>
    {/* ... */}
</FireCMS>
```

Se você começou pelo template PRO (`npx create-firecms-app --pro`), defina `VITE_FIRECMS_API_KEY` no arquivo `.env`; o template já a passa para o `FireCMS`.

Ao adicionar um novo projeto, como um ambiente de staging ou um novo cliente, adicione o ID dele à mesma licença em vez de criar outra, para que seja cobrado pelo valor de €49.

## Telemetria

A verificação de licença é uma única requisição do navegador para `api.firecms.co` quando um usuário logado abre o app. A página [Telemetria](/pt/docs/self/telemetry) detalha exatamente o que é enviado, o que guardamos e por quê.
