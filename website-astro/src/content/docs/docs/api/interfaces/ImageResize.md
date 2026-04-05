---
slug: "docs/api/interfaces/ImageResize"
title: "ImageResize"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / ImageResize

# Interface: ImageResize

Defined in: [types/src/types/properties.ts:963](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

## Properties

### format?

> `optional` **format**: `"original"` \| `"jpeg"` \| `"png"` \| `"webp"`

Defined in: [types/src/types/properties.ts:988](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Output format for the resized image.
- `original`: Keep the original format (default)
- `jpeg`: Convert to JPEG
- `png`: Convert to PNG
- `webp`: Convert to WebP

***

### maxHeight?

> `optional` **maxHeight**: `number`

Defined in: [types/src/types/properties.ts:972](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Maximum height in pixels. Image will be scaled down proportionally if taller.

***

### maxWidth?

> `optional` **maxWidth**: `number`

Defined in: [types/src/types/properties.ts:967](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Maximum width in pixels. Image will be scaled down proportionally if wider.

***

### mode?

> `optional` **mode**: `"contain"` \| `"cover"`

Defined in: [types/src/types/properties.ts:979](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Resize mode determines how the image fits within maxWidth/maxHeight bounds.
- `contain`: Scale down to fit within bounds, preserving aspect ratio (default)
- `cover`: Scale to fill bounds, preserving aspect ratio (may crop)

***

### quality?

> `optional` **quality**: `number`

Defined in: [types/src/types/properties.ts:994](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Quality for lossy formats (JPEG, WebP). Number between 0 and 100.
Higher is better quality but larger file size. Defaults to 80.
