---
slug: "docs/api/functions/AdminModeSyncer"
title: "AdminModeSyncer"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / AdminModeSyncer

# Function: AdminModeSyncer()

> **AdminModeSyncer**(`__namedParameters`): `null`

Defined in: [core/src/components/AdminModeSyncer.tsx:22](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/AdminModeSyncer.tsx)

A highly customizable utility component that observes react-router routes and
actively shifts the internal Rebase `adminModeController` context to match
the user's active window segment (e.g., Content vs Studio mode).

Placing this anywhere safely inside the Rebase layout automatically triggers
UI mode synchronization.

## Parameters

### \_\_namedParameters

[`AdminModeSyncerProps`](../interfaces/AdminModeSyncerProps)

## Returns

`null`
