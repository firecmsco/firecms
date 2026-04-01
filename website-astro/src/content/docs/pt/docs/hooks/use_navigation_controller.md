---
slug: pt/docs/hooks/use_navigation_controller
title: useNavigationController
sidebar_label: useNavigationController
description: Acesse o controlador de navegação do FireCMS para obter coleções, resolver caminhos e navegar.
---

Use este hook para acessar o controlador de navegação da aplicação. Este controlador serve como ponto central para:
*   Acessar a configuração resolvida de coleções e visualizações.
*   Resolver caminhos e IDs (por exemplo, converter um caminho de URL para um caminho do banco de dados).
*   Navegação programática.

### Uso

```tsx
import React from "react";
import { useNavigationController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function NavigationExample() {
    const navigationController = useNavigationController();

    const goToProducts = () => {
        // Navegar para a coleção de produtos
        // Isso gerencia o roteamento correto internamente
        navigationController.navigate("/c/products");
    };
    
    // Você também pode recuperar coleções pelo ID
    const productsCollection = navigationController.getCollection("products");

    return (
        <div>
            <p>Nome da coleção de produtos: {productsCollection?.name}</p>
            <Button onClick={goToProducts}>Ir para Produtos</Button>
        </div>
    );
}
```

### Métodos e propriedades principais

*   **`collections`**: Lista de todas as coleções de entidades resolvidas.
*   **`views`**: Lista de visualizações personalizadas de nível superior.
*   **`getCollection(pathOrId, includeUserOverride?)`**: Obter uma coleção pelo seu `id` ou `path`.
*   **`navigate(to, options?)`**: Navegar para uma rota específica.
*   **`refreshNavigation()`**: Forçar um recálculo da estrutura de navegação (útil se suas coleções são dinâmicas).
*   **`urlPathToDataPath(cmsPath)`**: Converter uma URL do CMS em um caminho da fonte de dados.
    *   Exemplo: `/c/products/B34SAP8Z` -> `products/B34SAP8Z`
*   **`buildUrlCollectionPath(path)`**: Converter um caminho da fonte de dados em uma URL do CMS.
    *   Exemplo: `products` -> `/c/products`
*   **`resolveIdsFrom(pathWithAliases)`**: Resolver aliases em um caminho para seus IDs reais.

### Interface NavigationController

```tsx
export type NavigationController = {
    collections?: EntityCollection[];
    views?: CMSView[];
    loading: boolean;
    initialised: boolean;
    
    getCollection: (pathOrId: string, includeUserOverride?: boolean) => EntityCollection | undefined;
    getCollectionById: (id: string) => EntityCollection | undefined;
    
    navigate: (to: string, options?: NavigateOptions) => void;
    refreshNavigation: () => void;
    
    // ... métodos utilitários para resolução de caminhos
}
```
