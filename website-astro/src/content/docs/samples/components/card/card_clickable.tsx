import React from "react";
import { Card } from "@firecms/ui";

export default function CardClickableDemo() {
    const handleClick = () => {
        console.log("Card clicked!");
    };

    return (
        <Card className={"p-4"} onClick={handleClick}>
            Clickable card content.
        </Card>
    );
}
