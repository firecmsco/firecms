---
slug: "docs/api/functions/buildAdditionalFieldDelegate"
title: "buildAdditionalFieldDelegate"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / buildAdditionalFieldDelegate

# Function: buildAdditionalFieldDelegate()

> **buildAdditionalFieldDelegate**\<`M`, `USER`\>(`additionalFieldDelegate`): [`AdditionalFieldDelegate`](../interfaces/AdditionalFieldDelegate)\<`M`, `USER`\>

Defined in: [common/src/util/builders.ts:122](https://github.com/rebaseco/rebase/blob/main/packages/common/src/util/builders.ts)

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
