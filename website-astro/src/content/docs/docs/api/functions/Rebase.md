---
slug: "docs/api/functions/Rebase"
title: "Rebase"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / Rebase

# Function: Rebase()

> **Rebase**\<`USER`\>(`props`): `Element`

Defined in: [core/Rebase.tsx:36](https://github.com/rebaseco/rebase/blob/main/packages/core/src/core/Rebase.tsx)

If you are using independent components of the CMS
you need to wrap them with this main component, so the internal hooks work.

This is the main component of Rebase. It acts as the provider of all the
internal contexts and hooks.

You only need to use this component if you are building a custom app.

## Type Parameters

### USER

`USER` *extends* [`User`](../type-aliases/User)

## Parameters

### props

[`RebaseProps`](../type-aliases/RebaseProps)\<`USER`\>

## Returns

`Element`
