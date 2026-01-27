---
slug: docs/hooks/use_clipboard
title: useClipboard
sidebar_label: useClipboard
description: Utility hook for copying text to the clipboard.
---

A utility hook to copy text to the system clipboard. It handles the `navigator.clipboard` API and fallback mechanisms.

### Usage

```tsx
import React from "react";
import { useClipboard } from "@firecms/core";
import { Button } from "@firecms/ui";

export function CopyButton({ text }: { text: string }) {
    const { copy, isCoppied } = useClipboard({
        copiedDuration: 2000 // Reset state after 2 seconds
    });

    return (
        <Button onClick={() => copy(text)}>
            {isCoppied ? "Copied!" : "Copy to clipboard"}
        </Button>
    );
}
```

### Options

```tsx
export interface UseClipboardProps {
    /**
     * Callback function called after the `copy` command is executed.
     */
    onSuccess?: (text: string) => void;

    /**
     * Triggers when the hook encounters an error.
     */
    onError?: (error: string) => void;

    /**
     * Disables the new clipboard API `navigator.clipboard` even if it is supported.
     */
    disableClipboardAPI?: boolean;

    /**
     * Duration in ms to keep the `isCoppied` flag true.
     */
    copiedDuration?: number;
}
```

### Return Values

```tsx
export interface useClipboardReturnType {
    /**
     * Use ref to pull the text content from.
     */
    ref: MutableRefObject<any>;

    /**
     * Perform the copy operation
     */
    copy: (text?: string) => void;

    /**
     * Perform the cut operation
     */
    cut: () => void;

    /**
     * Indicates whether the content was successfully copied.
     * Note: Typo inherited from the source library.
     */
    isCoppied: boolean;

    /**
     * Current selected clipboard content.
     */
    clipboard: string;

    /**
     * Clears the user clipboard.
     */
    clearClipboard: () => void;

    /**
     * Check if the browser supports the `navigator.clipboard` API.
     */
    isSupported: () => boolean;
}
```
