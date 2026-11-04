---
slug: "docs/api/functions/buildAdditionalFieldDelegate"
title: "buildAdditionalFieldDelegate"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / buildAdditionalFieldDelegate

# Function: buildAdditionalFieldDelegate()

> **buildAdditionalFieldDelegate**\<`M`, `USER`\>(`additionalFieldDelegate`): [`AdditionalFieldDelegate`](/docs/api/interfaces/AdditionalFieldDelegate)\<`M`, `USER`\>

Defined in: [util/builders.ts:125](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/builders.ts)

Identity function we use to defeat the type system of Typescript and build
additional field delegates views with all its properties

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

### USER

`USER` *extends* [`User`](/docs/api/type-aliases/User) = [`User`](/docs/api/type-aliases/User)

## Parameters

### additionalFieldDelegate

[`AdditionalFieldDelegate`](/docs/api/interfaces/AdditionalFieldDelegate)\<`M`, `USER`\>

## Returns

[`AdditionalFieldDelegate`](/docs/api/interfaces/AdditionalFieldDelegate)\<`M`, `USER`\>
