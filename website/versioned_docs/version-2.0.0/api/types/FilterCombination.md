---
id: "FilterCombination"
title: "Type alias: FilterCombination<Key>"
sidebar_label: "FilterCombination"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **FilterCombination**\<`Key`\>: `Partial`\<`Record`\<`Key`, ``"asc"`` \| ``"desc"``\>\>

Used to indicate valid filter combinations (e.g. created in Firestore)
If the user selects a specific filter/sort combination, the CMS checks if it's
valid, otherwise it reverts to the simpler valid case

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Key` | extends `string` |

#### Defined in

[packages/firecms_core/src/types/collections.ts:369](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L369)
