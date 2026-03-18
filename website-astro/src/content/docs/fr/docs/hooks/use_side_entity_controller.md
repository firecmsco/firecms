---
slug: fr/docs/hooks/use_side_entity_controller
title: useSideEntityController
sidebar_label: useSideEntityController
---

:::note
Veuillez noter que pour utiliser ces hooks, vous **devez** être dans
un composant (vous ne pouvez pas les utiliser directement depuis une fonction callback).
Cependant, les callbacks incluent généralement un `FireCMSContext`, qui contient tous
les contrôleurs.
:::

Vous pouvez utiliser ce contrôleur pour ouvrir la vue latérale d'entité utilisée pour éditer des entités.
C'est le même contrôleur que le CMS utilise lorsque vous cliquez sur une entité dans une vue de
collection.

En utilisant ce contrôleur, vous pouvez ouvrir un formulaire dans un dialogue latéral, même si le chemin et
le schéma de l'entité ne sont pas inclus dans la navigation principale définie dans `FireCMS`.

Les propriétés fournies par ce hook sont :

* `close()` Fermer le dernier panneau
* `sidePanels` Liste des panneaux latéraux d'entité actuellement ouverts
* `open (props: SideEntityPanelProps)`
  Ouvrir un nouveau dialogue latéral d'entité. Par défaut, le schéma et la configuration de la
  vue sont récupérés à partir des collections que vous avez spécifiées dans la navigation. Au
  minimum, vous devez passer le chemin de l'entité que vous souhaitez
  éditer. Vous pouvez définir un entityId si vous souhaitez éditer une entité existante
  (ou en créer une nouvelle avec cet id).

Exemple :

```tsx
import React from "react";
import { useSideEntityController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function ExampleCMSView() {

    const sideEntityController = useSideEntityController();

    // Vous n'avez pas besoin de fournir un schéma si le chemin de la collection est mappé dans
    // la navigation principale
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
                collection: customProductCollection // optionnel
            })}
            color="primary">
            Ouvrir une entité avec un schéma personnalisé
        </Button>
    );
}
```
