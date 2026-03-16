---
slug: pt/docs/properties/config/properties_common
title: Configuração comum
sidebar_label: Configuração comum
---

Cada propriedade no CMS tem sua própria API, mas todas compartilham algumas **props comuns**:

* `dataType` Tipo de dado da propriedade. (ex. `string`, `number`, etc.)
* `name` Nome da propriedade (ex. Preço).
* `description` Descrição da propriedade.
* `longDescription` Descrição mais longa de um campo, exibida sob um popover.
* `columnWidth` Largura em pixels desta coluna na vista de coleção.
* `readOnly` Se é uma propriedade somente leitura.
* `disabled` Se este campo está desabilitado. Você pode especificar uma configuração para definir o comportamento de propriedades desabilitadas. [PropertyDisabledConfig](../../api/interfaces/PropertyDisabledConfig)
* `Field` Se precisar renderizar um campo personalizado. Mais detalhes em [campos personalizados](../custom_fields.mdx)
* `Preview` Configure como uma propriedade é exibida em pré-visualização. Mais detalhes em [pré-visualizações personalizadas](../custom_previews)
* `customProps` Props adicionais passadas aos componentes definidos em `Field` ou `Preview`.
* `defaultValue` Este valor será definido por padrão para novas entidades.

  

