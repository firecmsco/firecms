import React from "react";
import { Chip } from "@rebasepro/ui";

export default function ChipClickableDemo() {
    const handleClick = () => {
        console.log("Chip clicked");
    };

    return (
        <Chip onClick={handleClick}>
            Clickable Chip
        </Chip>
    );
}