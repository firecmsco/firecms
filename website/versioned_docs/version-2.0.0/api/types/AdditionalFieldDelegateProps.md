---
id: "AdditionalFieldDelegateProps"
title: "Type alias: AdditionalFieldDelegateProps<M, UserType>"
sidebar_label: "AdditionalFieldDelegateProps"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **AdditionalFieldDelegateProps**\<`M`, `UserType`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |
| `UserType` | extends [`User`](User.md) = [`User`](User.md) |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `context` | [`FireCMSContext`](FireCMSContext.md)\<`UserType`\> |
| `entity` | [`Entity`](../interfaces/Entity.md)\<`M`\> |

#### Defined in

[packages/firecms_core/src/types/collections.ts:377](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L377)
