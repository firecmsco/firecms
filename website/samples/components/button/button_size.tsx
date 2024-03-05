import React from "react";
import { Button } from "firecms";

export default function ButtonSizeDemo() {
    return (
        <>
            <Button
                size={"sm"}
                onClick={() => console.log("Button clicked")}>
                Small
            </Button>
            <Button onClick={() => console.log("Button clicked")}>
                Medium
            </Button>
            <Button
                size={"lg"}
                onClick={() => console.log("Button clicked")}>
                Large
            </Button>
            <Button
                size={"xl"}
                onClick={() => console.log("Button clicked")}>
                XLarge
            </Button>
            <Button
                size={"2xl"}
                onClick={() => console.log("Button clicked")}>
                XXLarge
            </Button>
        </>
    );
}
