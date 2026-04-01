---
slug: "docs/api/interfaces/DrawerNavigationGroupProps"
title: "DrawerNavigationGroupProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / DrawerNavigationGroupProps

# Interface: DrawerNavigationGroupProps

Defined in: [core/src/core/DrawerNavigationGroup.tsx:8](https://github.com/rebaseco/rebase/blob/main/packages/core/src/core/DrawerNavigationGroup.tsx)

## Properties

### adminMenuOpen?

> `optional` **adminMenuOpen**: `boolean`

Defined in: [core/src/core/DrawerNavigationGroup.tsx:36](https://github.com/rebaseco/rebase/blob/main/packages/core/src/core/DrawerNavigationGroup.tsx)

Whether admin menu is open (used to control tooltip visibility)

***

### collapsed

> **collapsed**: `boolean`

Defined in: [core/src/core/DrawerNavigationGroup.tsx:20](https://github.com/rebaseco/rebase/blob/main/packages/core/src/core/DrawerNavigationGroup.tsx)

Whether the group is collapsed

***

### drawerOpen

> **drawerOpen**: `boolean`

Defined in: [core/src/core/DrawerNavigationGroup.tsx:28](https://github.com/rebaseco/rebase/blob/main/packages/core/src/core/DrawerNavigationGroup.tsx)

Whether the drawer is in open (expanded) state

***

### entries

> **entries**: [`NavigationEntry`](NavigationEntry)[]

Defined in: [core/src/core/DrawerNavigationGroup.tsx:16](https://github.com/rebaseco/rebase/blob/main/packages/core/src/core/DrawerNavigationGroup.tsx)

Navigation entries in this group

***

### group

> **group**: `string`

Defined in: [core/src/core/DrawerNavigationGroup.tsx:12](https://github.com/rebaseco/rebase/blob/main/packages/core/src/core/DrawerNavigationGroup.tsx)

Group name to display in header

***

### headerActions?

> `optional` **headerActions**: `ReactNode`

Defined in: [core/src/core/DrawerNavigationGroup.tsx:40](https://github.com/rebaseco/rebase/blob/main/packages/core/src/core/DrawerNavigationGroup.tsx)

Optional actions to render in the group header (e.g., "Add collection" button)

***

### onItemClick()?

> `optional` **onItemClick**: (`entry`) => `void`

Defined in: [core/src/core/DrawerNavigationGroup.tsx:44](https://github.com/rebaseco/rebase/blob/main/packages/core/src/core/DrawerNavigationGroup.tsx)

Optional callback when a navigation item is clicked

#### Parameters

##### entry

[`NavigationEntry`](NavigationEntry)

#### Returns

`void`

***

### onToggleCollapsed()

> **onToggleCollapsed**: () => `void`

Defined in: [core/src/core/DrawerNavigationGroup.tsx:24](https://github.com/rebaseco/rebase/blob/main/packages/core/src/core/DrawerNavigationGroup.tsx)

Callback when collapse state should toggle

#### Returns

`void`

***

### tooltipsOpen

> **tooltipsOpen**: `boolean`

Defined in: [core/src/core/DrawerNavigationGroup.tsx:32](https://github.com/rebaseco/rebase/blob/main/packages/core/src/core/DrawerNavigationGroup.tsx)

Whether tooltips should be shown (drawer closed + hovered)
