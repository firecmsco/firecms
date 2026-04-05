---
slug: "docs/api/functions/useUnsavedChangesDialog"
title: "useUnsavedChangesDialog"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / useUnsavedChangesDialog

# Function: useUnsavedChangesDialog()

> **useUnsavedChangesDialog**(`when`, `onOk`): `object`

Defined in: [core/src/hooks/useUnsavedChangesDialog.tsx:12](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/useUnsavedChangesDialog.tsx)

A single, unified hook to prevent navigation when there are unsaved changes.

It automatically handles:
1. Internal React Router navigation using `useBlocker`.
2. External browser navigation (page refresh, tab close) using `beforeunload`.

## Parameters

### when

`boolean`

### onOk

() => `void`

## Returns

`object`

### dialogProps

> **dialogProps**: [`UnsavedChangesDialogProps`](../interfaces/UnsavedChangesDialogProps)

### triggerDialog()

> **triggerDialog**: () => `void`

#### Returns

`void`
