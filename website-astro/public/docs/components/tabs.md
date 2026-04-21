# Tabs

Tabs are used for navigation between different views or sections within the same context.

## Usage

To use the `Tabs` component, import it from your components along with the child `Tab` components and pass the required props.

## Basic Tabs

A simple tab example with minimal configuration.

```tsx
import React, { useState } from "react";
import { Tabs, Tab } from "@firecms/ui";

export default function TabsBasicDemo() {
    const [value, setValue] = useState("tab1");

    return (
        <Tabs value={value} onValueChange={setValue}>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2">Tab 2</Tab>
            <Tab value="tab3">Tab 3</Tab>
        </Tabs>
    );
}
```

