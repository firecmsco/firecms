import React from "react";
import { Button } from "@firecms/ui";

export default function VariantButtonDemo() {
    return (
        <div className={"flex flex-row gap-4 items-center justify-center"}>
            <Button variant="filled">
                Filled Button
            </Button>
            <Button variant="outlined">
                Outlined Button
            </Button>
            <Button variant="text">
                Text Button
            </Button>
        </div>
    );
}
