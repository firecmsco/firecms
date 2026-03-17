---
title: Importação de Dados
---

![data_import.png](/img/data_import.png)

O **Plugin de Importação de Dados** para FireCMS permite importar dados de coleções de arquivos JSON, CSV e XLSX (Excel) diretamente para o seu aplicativo FireCMS. Este plugin fornece uma interface onde os usuários podem fazer upload de arquivos e mapear os dados existentes para as propriedades da coleção. Isso torna muito conveniente mover dados de um serviço para outro e converter dados nos tipos de dados corretos no banco de dados.

O plugin é capaz de fazer conversão automática de alguns tipos de dados, como datas.

A funcionalidade de importação também pode ser usada dentro do plugin de editor de coleções. No editor de coleções, você pode criar novas coleções a partir de um arquivo de dados. Ele consegue entender sua estrutura de dados corretamente e até inferir tipos como datas ou enums (mesmo se armazenados como strings).

## Instalação

Primeiro, instale o pacote do Plugin de Importação de Dados:

```sh
yarn add @firecms/data_import
```

## Configuração

Integre o Plugin de Importação de Dados usando o hook `useImportPlugin`. Você pode opcionalmente fornecer `ImportPluginProps` para personalizar seu comportamento.

### ImportPluginProps

- **`onAnalyticsEvent`**: Um callback acionado em eventos de analytics relacionados à importação.
    - **Tipo**: `(event: string, params?: any) => void`
    - **Padrão**: `undefined`

## Uso do Hook

Use o hook `useImportPlugin` para criar o plugin de importação e incluí-lo na configuração do FireCMS.

### Exemplo: Integrando o Plugin de Importação de Dados

```jsx
import React from "react";
import { CircularProgressCenter, FireCMS, useBuildModeController } from "@firecms/core";
import { useFirebaseStorageSource } from "@firecms/firebase";
import { useImportPlugin } from "@firecms/data_import";

export function App() {

    const importPlugin = useImportPlugin({
        onAnalyticsEvent: (event, params) => {
            console.log(`Import Event: ${event}`, params);
            // Integre com seu serviço de analytics se necessário
        },
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

## Usando a Funcionalidade de Importação

Após a integração, a funcionalidade de importação está disponível nas suas views de coleção. Os usuários podem fazer upload de arquivos JSON ou CSV para popular as coleções.

### Passos para Importar Dados

1. **Navegar até uma Coleção**: Abra a coleção desejada no seu aplicativo FireCMS.
2. **Iniciar Importação**: Clique na ação **Import** na toolbar de ações da coleção.
3. **Fazer Upload do Arquivo**: Selecione e faça upload do arquivo JSON ou CSV contendo os dados.
4. **Mapeamento de Tipos de Dados**: Selecione os tipos de dados e como seus dados devem ser mapeados para a estrutura atual.
4. **Processamento de Dados**: O plugin processa o arquivo e adiciona os dados à sua coleção.

## Tipos

### `ImportPluginProps`

Define as propriedades para o hook `useImportPlugin`.

```typescript
export type ImportPluginProps = {
    onAnalyticsEvent?: (event: string, params?: any) => void;
}
```

### `ImportAllowedParams`

Fornece contexto para determinar as permissões de importação.

```typescript
export type ImportAllowedParams = { 
    collectionEntitiesCount: number; 
    path: string; 
    collection: EntityCollection; 
};
```

## Exemplo: Rastreando Importações com o Google Analytics

```jsx
const importPlugin = useImportPlugin({
    onAnalyticsEvent: (event, params) => {
        if (window && window.gtag) {
            window.gtag('event', event, params);
        }
    },
});
```
