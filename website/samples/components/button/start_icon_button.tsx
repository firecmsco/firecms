import React from "react";
import { AddIcon, Button } from "@firecms/ui";

export default function StartIconButtonDemo() {
    return (
        <div className={"flex flex-row gap-4 items-center justify-center"}>
            <Button startIcon={<AddIcon/>}>
                Button with Icon
            </Button>
        </div>
    );
}
