import React from "react";
import { Alert } from "firecms";

export default function CustomStyleAlertDemo() {
    return (
        <Alert
            className="custom-class"
            style={{ borderLeft: '4px solid #4ade80' }}
            color="success"
        >
            This alert has custom styling.
        </Alert>
    );
}
