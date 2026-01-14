---
slug: "docs/api/functions/buildCollection"
title: "buildCollection"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / buildCollection

# Function: buildCollection()

> **buildCollection**\<`M`, `USER`\>(`collection`): [`EntityCollection`](../interfaces/EntityCollection)\<`M`, `USER`\>

Defined in: [util/builders.ts:29](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/builders.ts)

Identity function we use to defeat the type system of Typescript and build
collection views with all its properties

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](../type-aliases/User) = [`User`](../type-aliases/User)

## Parameters

### collection

[`EntityCollection`](../interfaces/EntityCollection)\<`M`, `USER`\>

## Returns

[`EntityCollection`](../interfaces/EntityCollection)\<`M`, `USER`\>
