import React from "react";
import { Avatar } from "@firecms/cloud";

export default function CustomStyleAvatarDemo() {
    return (
        <Avatar
            className="bg-red-500 dark:bg-red-700"
            // Example of custom size
            style={{ width: '80px', height: '80px' }}
        >
            CD
        </Avatar>
    );
}
