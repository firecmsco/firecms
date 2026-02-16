---
slug: "docs/api/type-aliases/Properties"
title: "Properties"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / Properties

# Type Alias: Properties\<M\>

> **Properties**\<`M`\> = `{ [k in keyof M]: Property<M[keyof M]> }`

Defined in: [types/properties.ts:241](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Record of properties of an entity or a map property

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`
