---
slug: "docs/api/interfaces/ExportMappingFunction"
title: "ExportMappingFunction"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / ExportMappingFunction

# Interface: ExportMappingFunction\<USER\>

Defined in: [types/export\_import.ts:17](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/export_import.ts)

## Type Parameters

### USER

`USER` *extends* [`User`](/docs/api/type-aliases/User) = [`User`](/docs/api/type-aliases/User)

## Properties

### builder()

> **builder**: (`__namedParameters`) => `string` \| `Promise`\<`string`\>

Defined in: [types/export\_import.ts:19](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/export_import.ts)

#### Parameters

##### \_\_namedParameters

###### context

[`FireCMSContext`](/docs/api/type-aliases/FireCMSContext)\<`USER`\>

###### entity

[`Entity`](/docs/api/interfaces/Entity)\<`any`\>

#### Returns

`string` \| `Promise`\<`string`\>

***

### key

> **key**: `string`

Defined in: [types/export\_import.ts:18](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/export_import.ts)
