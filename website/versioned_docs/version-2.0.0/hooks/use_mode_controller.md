---
id: use_mode_controller
title: useModeController
sidebar_label: useModeController
---

Hook to retrieve the current mode ("light" | "dark"), and `setMode`
or `toggle` functions to change it.

Consider that in order to use this hook you need to have a parent
`FireCMS` component in the tree.

### Props:

```tsx
{
    mode: "light" | "dark";
    setMode: (mode: "light" | "dark") => void;
    toggleMode: () => void;
}
```

