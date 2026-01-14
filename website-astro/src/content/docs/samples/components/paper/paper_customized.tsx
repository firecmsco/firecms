import React from "react";
import { Paper } from "@firecms/ui";

export default function PaperCustomizedDemo() {
    const customStyle = {
        padding: "20px",
        backgroundColor: "#f5f5f5",
        borderRadius: "4px",
        boxShadow: "0 2px 4px rgba(0,0,0,.1)"
    };

    return (
        <Paper style={customStyle} className="my-custom-paper">
            This is a customized paper component.
        </Paper>
    );
}