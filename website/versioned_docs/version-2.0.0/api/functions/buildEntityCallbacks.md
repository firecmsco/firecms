---
id: "buildEntityCallbacks"
title: "Function: buildEntityCallbacks"
sidebar_label: "buildEntityCallbacks"
sidebar_position: 0
custom_edit_url: null
---

▸ **buildEntityCallbacks**\<`M`\>(`callbacks`): [`EntityCallbacks`](../interfaces/EntityCallbacks.md)\<`M`\>

Identity function we use to defeat the type system of Typescript and preserve
the properties keys.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `callbacks` | [`EntityCallbacks`](../interfaces/EntityCallbacks.md)\<`M`, [`User`](../types/User.md)\> |

#### Returns

[`EntityCallbacks`](../interfaces/EntityCallbacks.md)\<`M`\>

#### Defined in

[packages/firecms_core/src/core/builders.ts:112](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/builders.ts#L112)
