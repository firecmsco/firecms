---
id: "cmsapp"
title: "Function: CMSApp"
sidebar_label: "CMSApp"
sidebar_position: 0
custom_edit_url: null
---

▸ **CMSApp**(`props`): `Element`

Main entry point for FireCMS. You can use this component as a full app,
by specifying collections and entity schemas.

This component is in charge of initialising Firebase, with the given
configuration object.

If you are building a larger app and need finer control, you can use
`CMSAppProvider` and `CMSMainView`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [CMSAppProps](../interfaces/cmsappprops.md) |

#### Returns

`Element`

#### Defined in

[core/CMSApp.tsx:28](https://github.com/Camberi/firecms/blob/b1328ad/src/core/CMSApp.tsx#L28)
