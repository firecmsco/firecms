import React, { useState } from "react";
import { Button, Sheet } from "@firecms/ui";

export default function SheetBasicDemo() {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <Button onClick={() => setOpen(true)}>Open Sheet</Button>
            <Sheet open={open} onOpenChange={setOpen}>
                <div className={"bg-white dark:bg-gray-800 p-4 h-full"}>
                    Sheet Content
                </div>
            </Sheet>
        </div>
    );
}
