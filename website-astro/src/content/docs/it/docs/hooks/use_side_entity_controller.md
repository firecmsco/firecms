---
slug: it/docs/hooks/use_side_entity_controller
title: useSideEntityController
sidebar_label: useSideEntityController
---

:::note
Tieni presente che per utilizzare questi hook **devi** essere all'interno
di un componente (non puoi usarli direttamente da una funzione callback).
Tuttavia, i callback di solito includono un `FireCMSContext`, che contiene tutti
i controller.
:::

Puoi usare questo controller per aprire la vista laterale delle entità utilizzata per modificarle.
Questo è lo stesso controller che il CMS usa quando clicchi su un'entità in una vista di
collezione.

Usando questo controller puoi aprire un formulario in un dialogo laterale, anche se il percorso e
lo schema dell'entità non sono inclusi nella navigazione principale definita in `FireCMS`.

Le proprietà fornite da questo hook sono:

* `close()` Chiudere l'ultimo pannello
* `sidePanels` Lista dei pannelli laterali di entità attualmente aperti
* `open (props: SideEntityPanelProps)`
  Aprire un nuovo dialogo laterale di entità. Per impostazione predefinita, lo schema e la configurazione della
  vista vengono ottenuti dalle collezioni specificate nella navigazione. Come
  minimo devi passare il percorso dell'entità che desideri
  modificare. Puoi impostare un entityId se desideri modificare un'entità esistente
  (o crearne una nuova con quell'id).

Esempio:

```tsx
import React from "react";
import { useSideEntityController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function ExampleCMSView() {

    const sideEntityController = useSideEntityController();

    // Non devi fornire uno schema se il percorso della collezione è mappato nella
    // navigazione principale
    const customProductCollection = buildCollection({
        name: "Product",
        properties: {
            name: {
                name: "Name",
                validation: { required: true },
                dataType: "string"
            },
        }
    });

    return (
        <Button
            onClick={() => sideEntityController.open({
                entityId: "B003WT1622",
                path: "/products",
                collection: customProductCollection // opzionale
            })}
            color="primary">
            Apri entità con schema personalizzato
        </Button>
    );
}
```
