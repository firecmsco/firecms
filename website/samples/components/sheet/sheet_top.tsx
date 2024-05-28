import React, { useState } from "react";
import { Button, Sheet } from "@firecms/ui";

export default function SheetTopDemo() {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <Button onClick={() => setOpen(true)}>Open Top Sheet</Button>
            <Sheet open={open} onOpenChange={setOpen} side="top">
                <div className={"bg-white dark:bg-gray-800 p-4 w-full"}>
                    Sheet Content
                </div>
            </Sheet>
        </div>
    );
}
