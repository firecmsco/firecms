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