---
slug: "docs/api/interfaces/DatePreviewProps"
title: "DatePreviewProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / DatePreviewProps

# Interface: DatePreviewProps

Defined in: [core/src/preview/components/DatePreview.tsx:8](https://github.com/rebaseco/rebase/blob/main/packages/core/src/preview/components/DatePreview.tsx)

## Properties

### date

> **date**: `Date`

Defined in: [core/src/preview/components/DatePreview.tsx:9](https://github.com/rebaseco/rebase/blob/main/packages/core/src/preview/components/DatePreview.tsx)

***

### mode?

> `optional` **mode**: `"date"` \| `"date_time"`

Defined in: [core/src/preview/components/DatePreview.tsx:13](https://github.com/rebaseco/rebase/blob/main/packages/core/src/preview/components/DatePreview.tsx)

Display mode: "date" for date-only, "date_time" for date and time

***

### timezone?

> `optional` **timezone**: `string`

Defined in: [core/src/preview/components/DatePreview.tsx:18](https://github.com/rebaseco/rebase/blob/main/packages/core/src/preview/components/DatePreview.tsx)

IANA timezone identifier (e.g., "America/New_York")
When specified, the date will be displayed in this timezone
