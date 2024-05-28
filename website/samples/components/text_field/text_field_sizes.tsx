import React, { useState } from "react";
import { TextField } from "@firecms/ui";

export default function TextFieldSizeDemo() {
    const [value, setValue] = useState("");

    return (
        <div className="flex flex-col gap-4">
            <TextField
                value={value}
                onChange={(e) => setValue(e.target.value)}
                label="Smallest Size"
                placeholder="Smallest size"
                size="smallest"
            />
            <TextField
                value={value}
                onChange={(e) => setValue(e.target.value)}
                label="Small Size"
                placeholder="Small size"
                size="small"
            />
            <TextField
                value={value}
                onChange={(e) => setValue(e.target.value)}
                label="Medium Size"
                placeholder="Medium size"
                size="medium"
            />
        </div>
    );
}