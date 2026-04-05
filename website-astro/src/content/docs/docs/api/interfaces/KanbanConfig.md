---
slug: "docs/api/interfaces/KanbanConfig"
title: "KanbanConfig"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / KanbanConfig

# Interface: KanbanConfig\<M\>

Defined in: [types/src/types/collections.ts:456](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Configuration for Kanban board view mode.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### columnProperty

> **columnProperty**: `Extract`\<keyof `M`, `string`\>

Defined in: [types/src/types/collections.ts:463](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Property key to use for Kanban board columns.
Must reference a string property with enumValues defined.
Entities will be grouped into columns based on this property's value.
The column order is determined by the order of enumValues in the property.
