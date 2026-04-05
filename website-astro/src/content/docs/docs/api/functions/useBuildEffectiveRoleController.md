---
slug: "docs/api/functions/useBuildEffectiveRoleController"
title: "useBuildEffectiveRoleController"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / useBuildEffectiveRoleController

# Function: useBuildEffectiveRoleController()

> **useBuildEffectiveRoleController**(): [`EffectiveRoleController`](../interfaces/EffectiveRoleController)

Defined in: [core/src/hooks/useBuildEffectiveRoleController.tsx:10](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/useBuildEffectiveRoleController.tsx)

Use this hook to build an effective role controller that determines
what role is simulated in Editor mode when Dev mode is active.

It uses localStorage to persist the simulated role across reloads.

## Returns

[`EffectiveRoleController`](../interfaces/EffectiveRoleController)
