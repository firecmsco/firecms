---
slug: "docs/api/functions/buildAdditionalFieldDelegate"
title: "buildAdditionalFieldDelegate"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / buildAdditionalFieldDelegate

# Function: buildAdditionalFieldDelegate()

> **buildAdditionalFieldDelegate**\<`M`, `USER`\>(`additionalFieldDelegate`): [`AdditionalFieldDelegate`](../interfaces/AdditionalFieldDelegate)\<`M`, `USER`\>

Defined in: [util/builders.ts:125](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/builders.ts)

Identity function we use to defeat the type system of Typescript and build
additional field delegates views with all its properties

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

### USER

`USER` *extends* [`User`](../type-aliases/User) = [`User`](../type-aliases/User)

## Parameters

### additionalFieldDelegate

[`AdditionalFieldDelegate`](../interfaces/AdditionalFieldDelegate)\<`M`, `USER`\>

## Returns

[`AdditionalFieldDelegate`](../interfaces/AdditionalFieldDelegate)\<`M`, `USER`\>
