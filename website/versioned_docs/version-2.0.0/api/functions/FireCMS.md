---
id: "FireCMS"
title: "Function: FireCMS"
sidebar_label: "FireCMS"
sidebar_position: 0
custom_edit_url: null
---

▸ **FireCMS**\<`UserType`\>(`props`): `Element`

If you are using independent components of the CMS
you need to wrap them with this main component, so the internal hooks work.

This is the main component of FireCMS. It acts as the provider of all the
internal contexts and hooks.

You only need to use this component if you are building a custom app.
In most cases you can just use the FirebaseCMSApp component.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `UserType` | extends [`User`](../types/User.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`FireCMSProps`](../types/FireCMSProps.md)\<`UserType`\> |

#### Returns

`Element`

#### Defined in

[packages/firecms_core/src/core/FireCMS.tsx:38](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/FireCMS.tsx#L38)
