# SearchBar


The `SearchBar` component is designed for implementing search functionalities. It supports features like debouncing search input, expandable input sizes, and showing loading state.

## Usage

To use the `SearchBar`, import it from your components and pass the necessary props like `onTextSearch`, `placeholder`, `expandable`, `large`, `autoFocus`, `disabled`, `loading`, and `inputRef`.

## Basic SearchBar

The basic usage of `SearchBar` with minimal configuration.

```tsx
import React from "react";
import { SearchBar } from "@firecms/ui";

export default function SearchBarBasicDemo() {
    return (
        <SearchBar onTextSearch={(text) => console.log("Search:", text)} />
    );
}
```

## SearchBar with Loading State

A demonstration of the `SearchBar` showing a loading indicator.

```tsx
import React from "react";
import { SearchBar } from "@firecms/ui";

export default function SearchBarLoadingDemo() {
    return (
        <SearchBar loading />
    );
}
```

## SearchBar Expandable

This example shows how to make the `SearchBar` expandable upon focusing.

```tsx
import React from "react";
import { SearchBar } from "@firecms/ui";

export default function SearchBarExpandableDemo() {
    return (
        <SearchBar expandable />
    );
}
```

## Large SearchBar

Showcases a larger variant of the `SearchBar`.

```tsx
import React from "react";
import { SearchBar } from "@firecms/ui";

export default function SearchBarLargeDemo() {
    return (
        <SearchBar large />
    );
}
```

