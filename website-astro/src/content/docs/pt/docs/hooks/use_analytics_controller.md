---
slug: pt/docs/hooks/use_analytics_controller
title: useAnalyticsController
sidebar_label: useAnalyticsController
description: Hook para acessar o controlador de analytics e ouvir eventos do CMS.
---

Hook para acessar o controlador de analytics. Este controlador permite ouvir eventos internos do CMS, como navegação, criação de entidades, edição, etc.

Você pode usá-lo para integrar com provedores de analytics de terceiros como Google Analytics, Mixpanel ou Segment.

### Uso

```tsx
import { useAnalyticsController } from "@firecms/core";
import { useEffect } from "react";

export function MyAnalyticsComponent() {
    const analyticsController = useAnalyticsController();

    useEffect(() => {
        // Normalmente você configuraria isso no ponto de entrada principal da sua aplicação
        // Isso é apenas para demonstração
        console.log("Analytics controller available");
    }, [analyticsController]);

    return null;
}
```

### Interface

```tsx
export type AnalyticsController = {
    /**
     * Callback utilizado para receber eventos de analytics do CMS
     */
    onAnalyticsEvent?: (event: CMSAnalyticsEvent, data?: object) => void;
}
```

### Eventos

O tipo `CMSAnalyticsEvent` define todos os eventos possíveis:

* `entity_click`: O usuário clicou em uma entidade de uma coleção
* `edit_entity_clicked`: O usuário clicou no botão de edição
* `new_entity_click`: O usuário clicou no botão "Novo"
* `new_entity_saved`: Uma nova entidade foi criada com sucesso
* `entity_edited`: Uma entidade foi atualizada
* `entity_deleted`: Uma entidade foi excluída
* `drawer_navigate_to_collection`: O usuário navegou para uma coleção a partir do menu lateral
* `home_navigate_to_collection`: O usuário navegou para uma coleção a partir da página inicial
* ... e mais.
