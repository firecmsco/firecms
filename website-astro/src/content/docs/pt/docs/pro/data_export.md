---
slug: pt/docs/pro/data_export
title: Exportação de Dados
description: Exporte suas coleções do Firestore para JSON ou CSV com o plugin de Exportação de Dados do FireCMS. Ideal para backups, migrações e análise de dados.
---

![data_export.png](/img/data_export.png)

Exporte seus dados **Firestore** diretamente do seu **painel de administração**. O Plugin de Exportação de Dados adiciona exportação JSON e CSV com um único clique a qualquer coleção do FireCMS.

:::tip[Casos de uso comuns]
- **Backups**: Crie snapshots regulares dos seus dados
- **Migrações**: Mova dados entre ambientes ou bancos de dados
- **Relatórios**: Alimente dados em planilhas ou ferramentas BI
- **Conformidade**: Exporte dados para auditorias ou solicitações GDPR
:::

## Instalação

Primeiro, certifique-se de ter instalado as dependências necessárias. Para usar o plugin, você precisa ter o FireCMS configurado em seu projeto.

```sh
yarn add @firecms/data_export
```

ou

```sh
npm install @firecms/data_export
```

## Configuração

O plugin requer configuração mínima e pode ser facilmente integrado à sua configuração do FireCMS. Você pode personalizar o comportamento de exportação usando `ExportPluginProps`.

### Parâmetros do ExportPluginProps

Abaixo estão os parâmetros que você pode configurar:

- **`exportAllowed`**: Uma função que determina se a exportação é permitida com base nos parâmetros fornecidos.
    - **Tipo**: `(props: ExportAllowedParams) => boolean`
    - **Padrão**: `undefined` (a exportação é permitida por padrão)
- **`notAllowedView`**: Um nó React para exibir quando a exportação não é permitida.
    - **Tipo**: `React.ReactNode`
    - **Padrão**: `undefined`
- **`onAnalyticsEvent`**: Uma função callback acionada em eventos de analytics relacionados à exportação.
    - **Tipo**: `(event: string, params?: any) => void`
    - **Padrão**: `undefined`

### ExportAllowedParams

O tipo `ExportAllowedParams` fornece contexto para a função `exportAllowed`:

- **`collectionEntitiesCount`**: O número de entidades na coleção.
    - **Tipo**: `number`
- **`path`**: O caminho da coleção no FireCMS.
    - **Tipo**: `string`
- **`collection`**: A entidade de coleção.
    - **Tipo**: `EntityCollection`

## Uso do Hook

O principal hook para utilizar a funcionalidade do plugin é `useExportPlugin`. Aqui está um exemplo de como usá-lo:

```jsx
import React from "react";
import { FireCMS } from "@firecms/core";
import { useExportPlugin } from "@firecms/data_export";

function App() {
    
    const exportPlugin = useExportPlugin({
        exportAllowed: ({
                            collectionEntitiesCount,
                            path,
                            collection
                        }) => {
            // Exemplo: Permitir exportação apenas se houver mais de 10 entidades
            return collectionEntitiesCount > 10;
        },
        notAllowedView: <div>Exportação não é permitida.</div>,
        onAnalyticsEvent: (event, params) => {
            console.log(`Export Event: ${event}`, params);
        },
    });

    const plugins = [exportPlugin];

    const navigationController = useBuildNavigationController({
        // ... restante da configuração
        plugins
    });
    
    return (
            <FireCMS
                navigationController={navigationController}
                {/*... restante da sua configuração */}
            >
              {({ context, loading }) => {
                  // ... seus componentes
              }}
            </FireCMS>
    );
}

export default App;
```

## Configurando o Plugin

Para integrar o Plugin de Exportação de Dados no FireCMS, use o hook `useExportPlugin` e passe o plugin resultante para a configuração do FireCMS. Você normalmente vai querer fazer isso no seu componente App principal.

## Usando a Funcionalidade de Exportação

Uma vez integrado o plugin, você pode usar a funcionalidade de exportação diretamente nas suas views de coleção. O plugin adiciona ações de exportação às suas views de coleção, permitindo que os usuários exportem dados como JSON ou CSV.

### Exemplo: Exportando uma Coleção

1. Navegue até a coleção desejada no seu aplicativo FireCMS.
2. Clique na ação **Export** na toolbar de ações da coleção.
3. Escolha o formato de exportação desejado (JSON ou CSV).
4. O arquivo exportado será baixado para o seu dispositivo.

## Personalizando o Comportamento de Exportação

Você pode personalizar como a funcionalidade de exportação se comporta fornecendo implementações personalizadas para as props `exportAllowed`, `notAllowedView` e `onAnalyticsEvent`.

### Exemplo: Restringindo Exportação com Base no Papel do Usuário

```jsx
const exportPlugin = useExportPlugin({
    exportAllowed: ({
                        collection,
                        path,
                        collectionEntitiesCount
                    }) => {
        // Permitir exportação apenas para admins
        return userRoles.includes('admin');
    },
    notAllowedView: <div>Apenas administradores podem exportar dados.</div>,
    onAnalyticsEvent: (event, params) => {
        // Registrar eventos de exportação para auditoria
        logAnalytics(event, params);
    },
});
```

## Tipos

### `ExportPluginProps`

Define as propriedades que podem ser passadas para o hook `useExportPlugin`.

```typescript
export type ExportPluginProps = {
    exportAllowed?: (props: ExportAllowedParams) => boolean;
    notAllowedView?: React.ReactNode;
    onAnalyticsEvent?: (event: string, params?: any) => void;
}
```

### `ExportAllowedParams`

Fornece contexto para determinar se a exportação é permitida.

```typescript
export type ExportAllowedParams = {
    collectionEntitiesCount: number;
    path: string;
    collection: EntityCollection;
};
```
