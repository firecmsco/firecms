---
id: "useSnackbarController"
title: "Function: useSnackbarController"
sidebar_label: "useSnackbarController"
sidebar_position: 0
custom_edit_url: null
---

▸ **useSnackbarController**(): `Object`

Hook to retrieve the SnackbarContext.

Consider that in order to use this hook you need to have a parent
`FireCMS`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `close` | () => `void` |
| `open` | (`props`: \{ `autoHideDuration?`: `number` ; `message`: `ReactNode` ; `type`: [`SnackbarMessageType`](../types/SnackbarMessageType.md)  }) => `void` |

**`See`**

SnackbarController

#### Defined in

[packages/firecms_core/src/hooks/useSnackbarController.tsx:42](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/useSnackbarController.tsx#L42)
