import React from "react";
import { Button } from "@firecms/ui";

export default function FullWidthButtonDemo() {
    return (
        <div className={"flex flex-row gap-4 items-center justify-center"}>
            <Button fullWidth>
                Full Width Button
            </Button>
        </div>
    );
}
