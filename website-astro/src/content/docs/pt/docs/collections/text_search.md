---
title: Pesquisa de texto
slug: pt/docs/collections/text_search
description: Adicione pesquisa full-text ao FireCMS com Typesense ou Algolia. Use nossa Extensão Firebase para pesquisa tolerante a erros de digitação a ~$7/mês, ou integre com Algolia para necessidades enterprise.
---

:::note[A solução descrita aqui é específica para o Firestore]
Se você está desenvolvendo seu próprio datasource, é livre para implementar a pesquisa de texto da maneira que fizer mais sentido.
:::

O Firestore não suporta pesquisa de texto nativa, então precisamos recorrer a soluções externas. Se você especificar uma flag `textSearchEnabled` na **coleção**, verá uma barra de pesquisa no topo da visualização da coleção.

## Opções de pesquisa

| Opção | Custo | Configuração | Melhor para |
|-------|-------|--------------|-------------|
| **Extensão Typesense** (Recomendado) | ~$7-14/mês fixo | 5 min | A maioria dos projetos |
| **Algolia** | Preços por consulta | 15 min | Enterprise, geo-search |
| **Pesquisa de texto local** | Gratuita | 1 min | Coleções pequenas (<1000 doc) |

---

## Usando Typesense (Recomendado)

A **extensão FireCMS Typesense** implanta um servidor de pesquisa Typesense em uma VM do Compute Engine e sincroniza automaticamente seus dados do Firestore.

- 🔍 **Pesquisa tolerante a erros de digitação** - "headphnes" encontra "headphones"
- ⚡ **Respostas em sub-milissegundos**
- 💰 **Custo mensal fixo** - Sem cobranças por consulta
- 🔄 **Sincronização em tempo real** - Os documentos são indexados automaticamente

### Instalação

**Pré-requisitos:**
- Projeto Firebase com Firestore
- Faturamento GCP habilitado
- [gcloud CLI](https://cloud.google.com/sdk/docs/install) instalado

**Passo 1: Instale a extensão**

```bash
firebase ext:install https://github.com/firecmsco/typesense-extension --project=YOUR_PROJECT_ID
```

**Passo 2: Conceda as permissões**

```bash
export PROJECT_ID=your-project-id
export EXT_INSTANCE_ID=typesense-search  # Nome padrão da extensão

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:ext-${EXT_INSTANCE_ID}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/compute.admin" --condition=None

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:ext-${EXT_INSTANCE_ID}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.admin" --condition=None

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:ext-${EXT_INSTANCE_ID}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/datastore.user" --condition=None
```

**Passo 3: Provisione o servidor de pesquisa**

```bash
curl "https://REGION-PROJECT_ID.cloudfunctions.net/ext-typesense-search-provisionSearchNode"
```

Aguarde ~2 minutos. Os documentos existentes são indexados automaticamente.

### Uso do Typesense no FireCMS Cloud

Navegue até **Configurações do projeto** e configure:

| Configuração | Valor |
|--------------|-------|
| **Região** | A região da sua extensão (ex., `us-central1`) |
| **ID da instância da extensão** | Padrão: `typesense-search` |

O FireCMS Cloud se conecta automaticamente à sua instância Typesense.

### Uso do Typesense no FireCMS Self-Hosted

```typescript
import { buildFireCMSSearchController, useFirestoreDelegate } from "@firecms/firebase";

const textSearchControllerBuilder = buildFireCMSSearchController({
  region: "us-central1",  // A região da sua extensão
  extensionInstanceId: "typesense-search"  // Nome padrão
});

export function App() {
  const firestoreDelegate = useFirestoreDelegate({
    firebaseApp,
    textSearchControllerBuilder
  });
  // ... restante da sua aplicação
}
```

---

## Usando Algolia

Algolia é um serviço de pesquisa gerenciado com preços por consulta. Recomendado para necessidades enterprise ou funcionalidades avançadas como geo-search.

Você precisa definir um `FirestoreTextSearchControllerBuilder` e adicioná-lo à sua configuração. Configure uma conta Algolia e sincronize os documentos usando a [extensão Firebase](https://extensions.dev/extensions/algolia/firestore-algolia-search) deles.

### Uso do Algolia no FireCMS Cloud

```tsx
import { algoliasearch, SearchClient } from "algoliasearch";

import {
    performAlgoliaTextSearch,
    buildExternalSearchController,
    FirestoreTextSearchController,
    buildCollection,
    FireCMSCloudApp,
    EntityCollectionsBuilder,
    FireCMSAppConfig
} from "@firecms/cloud";

const client: SearchClient | undefined = algoliasearch("YOUR_ALGOLIA_APP_ID", "YOUR_ALGOLIA_SEARCH_KEY");

const algoliaSearchController = buildExternalSearchController({
    isPathSupported: (path) => path === "products",
    search: async ({
                       path,
                       searchString
                   }) => {
        if (path === "products") {
            return performAlgoliaTextSearch(client, "products", searchString);
        }
        return undefined;
    }
});


const appConfig: FireCMSAppConfig = {
    version: "1",
    textSearchControllerBuilder: algoliaSearchController,
    // ...
}
```

### Uso do Algolia no FireCMS Self-Hosted

```tsx
import { algoliasearch, SearchClient } from "algoliasearch";

import { buildExternalSearchController, performAlgoliaTextSearch } from "@firecms/firebase";

const client: SearchClient | undefined = algoliasearch("YOUR_ALGOLIA_APP_ID", "YOUR_ALGOLIA_SEARCH_KEY");

const algoliaSearchController = buildExternalSearchController({
    isPathSupported: (path) => path === "products",
    search: async ({
                       path,
                       searchString
                   }) => {
        if (path === "products")
            return performAlgoliaTextSearch(client, "products", searchString);
        return undefined;
    }
});


export function App() {

    // ...
    const firestoreDelegate = useFirestoreDelegate({
        firebaseApp,
        textSearchControllerBuilder: algoliaSearchControllerBuilder
    });
    // ...
}

```


### Pesquisa de texto local

A partir do FireCMS v3, fornecemos uma implementação de pesquisa de texto local. Isso é útil para coleções pequenas ou quando você deseja fornecer uma maneira rápida de pesquisar nos seus dados.

No entanto, para coleções maiores, você vai querer usar um provedor de **pesquisa externa**, como Algolia. Esta é a abordagem recomendada.

Você pode usar a pesquisa de texto local no FireCMS Cloud ou nas versões self-hosted.

Para o FireCMS Cloud, basta habilitá-la na interface.

Para versões self-hosted, você pode habilitá-la definindo `localTextSearchEnabled` em `useFirestoreDelegate`.
Depois, precisa marcar cada coleção com `textSearchEnabled: true`.

Se você declarou um provedor de indexação externo, a pesquisa de texto local será efetiva **apenas para os caminhos não suportados pelo provedor externo**.
