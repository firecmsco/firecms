---
title: Configuration commune
slug: fr/docs/properties/config/properties_common
sidebar_label: Configuration commune
---


Chaque propriété dans le CMS a sa propre API, mais elles partagent toutes certaines **props communes** :

* `dataType` Type de donnée de la propriété. (ex. `string`, `number`, etc.)

* `name` Nom de la propriété (ex. Prix).

* `description` Description de la propriété.

* `longDescription` Description plus longue d'un champ, affichée sous un popover.

* `columnWidth` Largeur en pixels de cette colonne dans la vue de collection. Si non
  définie, la largeur est déduite en fonction des autres configurations.

* `readOnly` Si c'est une propriété en lecture seule. Quand défini à true, elle est rendue comme un
  aperçu.

* `disabled` Si ce champ est désactivé. Quand défini à true, il est rendu comme un
  champ désactivé. Vous pouvez aussi spécifier une configuration pour définir le
  comportement des propriétés désactivées (incluant des messages personnalisés, effacer la valeur lors de la
  désactivation ou masquer complètement le champ)
  [PropertyDisabledConfig](../../api/interfaces/PropertyDisabledConfig)

* `Field`
  Si vous avez besoin de rendre un champ personnalisé, vous pouvez créer un composant qui
  prend `FieldProps` comme props. Vous recevez la valeur, une fonction pour mettre à jour
  la valeur et des props utilitaires supplémentaires comme s'il y a une erreur. Vous
  pouvez le personnaliser en passant des props personnalisées qui sont reçues dans le
  composant. Plus de détails sur comment
  implémenter des [champs personnalisés](../custom_fields.mdx)

* `Preview`
  Configurez comment une propriété est affichée en aperçu, par ex. dans la vue de collection.
  Vous pouvez la personnaliser en passant des props personnalisées qui sont reçues dans
  le composant. Plus de détails sur comment
  implémenter des [aperçus personnalisés](../custom_previews)

* `customProps`
  Props supplémentaires passées aux composants définis dans `Field` ou
  dans `Preview`.

* `defaultValue`
  Cette valeur sera définie par défaut pour les nouvelles entités.

  

