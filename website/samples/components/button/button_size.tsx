import React from "react";
import { Button } from "firecms";

export default function ButtonSizeDemo() {
    return (
        <div className={"flex flex-row gap-4 items-center justify-center"}>
            <Button
                size={"small"}
                onClick={() => console.log("Button clicked")}>
                Small
            </Button>
            <Button onClick={() => console.log("Button clicked")}>
                Medium
            </Button>
            <Button
                size={"large"}
                onClick={() => console.log("Button clicked")}>
                Large
            </Button>
        </div>
    );
}
