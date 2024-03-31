import React from "react";
import { AddIcon, IconButton } from "@firecms/ui";

export default function IconButtonShapeDemo() {
    return (
        <>
            <IconButton
                variant="filled"
                shape="circular"
                onClick={() => console.log("Circular Clicked!")}>
                <AddIcon/>
            </IconButton>
            <IconButton
                variant="filled"
                shape="square"
                onClick={() => console.log("Square Clicked!")}>
                <AddIcon/>
            </IconButton>
        </>
    );
}
