---
id: "FireCMSCustomization"
title: "Type alias: FireCMSCustomization"
sidebar_label: "FireCMSCustomization"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **FireCMSCustomization**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `fields?` | `Record`<`string`, [`FieldConfig`](FieldConfig.md)\> | Record of custom form fields to be used in the CMS. You can use the key to reference the custom field in the `fieldConfig` prop of a property in a collection. |
| `views?` | [`CMSView`](../interfaces/CMSView.md)[] \| [`CMSViewsBuilder`](CMSViewsBuilder.md) | Custom additional views created by the developer, added to the main navigation |

#### Defined in

[lib/src/types/firecms_external_config.tsx:5](https://github.com/FireCMSco/firecms/blob/b01ca637/lib/src/types/firecms_external_config.tsx#L5)
