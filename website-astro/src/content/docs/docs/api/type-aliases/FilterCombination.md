---
slug: "docs/api/type-aliases/FilterCombination"
title: "FilterCombination"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / FilterCombination

# Type Alias: FilterCombination\<Key\>

> **FilterCombination**\<`Key`\> = `Partial`\<`Record`\<`Key`, `"asc"` \| `"desc"`\>\>

Defined in: [types/collections.ts:467](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Used to indicate valid filter combinations (e.g. created in Firestore)
If the user selects a specific filter/sort combination, the CMS checks if it's
valid, otherwise it reverts to the simpler valid case

## Type Parameters

### Key

`Key` *extends* `string`
