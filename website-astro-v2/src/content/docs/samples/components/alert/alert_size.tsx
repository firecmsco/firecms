import React from "react";
import { Alert } from "@firecms/ui";

export default function AlertSieDemo() {
    return (
        <div className="w-full space-y-4">
            <Alert size="small">
                This is an small alert.
            </Alert>
            <Alert size="medium">
                This is a medium alert.
            </Alert>
            <Alert size="large">
                This is a large alert.
            </Alert>
        </div>
    );
}
