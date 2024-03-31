import React from "react";
import { Alert } from "@firecms/ui";

export default function CustomStyleAlertDemo() {
    return (
        <Alert
            className="custom-class"
            style={{
                borderLeft: "4px solid #4ade80",
                color: "#fff",
                background: "repeating-linear-gradient(45deg,#606dbc,#606dbc 10px,#465298 10px,#465298 20px)"
            }}
            color="success"
        >
            This alert has custom styling.
        </Alert>
    );
}
