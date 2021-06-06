---
id: "cmsappprovider"
title: "Function: CMSAppProvider"
sidebar_label: "CMSAppProvider"
sidebar_position: 0
custom_edit_url: null
---

▸ **CMSAppProvider**(`props`): `Element`

If you are using independent components of the CMS instead of `CMSApp`
you need to wrap them with this provider, so the internal hooks work.

This provider also contains the component in charge of displaying the side
entity dialogs, so you can display them outside the main CMS view.

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `PropsWithChildren`<[CMSAppProviderProps](../interfaces/cmsappproviderprops.md)\> |

#### Returns

`Element`

#### Defined in

[CMSAppProvider.tsx:120](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProvider.tsx#L120)
