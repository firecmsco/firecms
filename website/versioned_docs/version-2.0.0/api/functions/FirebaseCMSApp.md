---
id: "FirebaseCMSApp"
title: "Function: FirebaseCMSApp"
sidebar_label: "FirebaseCMSApp"
sidebar_position: 0
custom_edit_url: null
---

▸ **FirebaseCMSApp**(`props`): `Element`

This is the default implementation of a FireCMS app using the Firebase services
as a backend.
You can use this component as a full app, by specifying collections and
entity collections.

This component is in charge of initialising Firebase, with the given
configuration object.

If you are building a larger app and need finer control, you can use
[FireCMS](FireCMS.md), [Scaffold](Scaffold.md), [SideDialogs](SideDialogs.md)
and [NavigationRoutes](NavigationRoutes.md) instead.

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`FirebaseCMSAppProps`](../types/FirebaseCMSAppProps.md) |

#### Returns

`Element`

#### Defined in

[lib/src/firebase_app/FirebaseCMSApp.tsx:50](https://github.com/FireCMSco/firecms/blob/b01ca637/lib/src/firebase_app/FirebaseCMSApp.tsx#L50)
