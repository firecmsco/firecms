import React from "react";
import { Alert } from "firecms";

export default function AlertColorDemo() {
    return (
        <div className="space-y-4">
            <Alert color="error">
                This is an error alert.
            </Alert>
            <Alert color="warning">
                This is a warning alert.
            </Alert>
            <Alert color="info">
                This is an info alert.
            </Alert>
            <Alert color="success">
                This is a success alert.
            </Alert>
        </div>
    );
}
