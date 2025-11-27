import React, { useState } from "react";
import { Button, Collapse, Container, Paper } from "@firecms/ui";

export default function CollapseCustomDurationDemo() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={"flex flex-col items-center gap-4"}>
            <Button onClick={() => setIsOpen(!isOpen)}>Toggle</Button>
            <Collapse in={isOpen} duration={500}>
                <Paper className={"p-4"}>
                    This content has a custom animation duration.
                </Paper>
            </Collapse>
        </div>
    );
}
