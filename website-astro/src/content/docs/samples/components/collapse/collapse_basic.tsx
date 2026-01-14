import React, { useState } from "react";
import { Button, Collapse, Paper } from "@firecms/ui";

export default function CollapseBasicDemo() {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className={"flex flex-col items-center gap-4"}>
            <Button onClick={() => setIsOpen(!isOpen)}>Toggle</Button>
            <Collapse in={isOpen}>
                <Paper className={"p-4"}>
                    Content to show or hide
                </Paper>
            </Collapse>
        </div>
    );
}
