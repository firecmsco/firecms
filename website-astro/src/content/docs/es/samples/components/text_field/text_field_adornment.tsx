import React, { useState } from "react";
import { TextField } from "@firecms/ui";

export default function TextFieldAdornmentDemo() {
    const [value, setValue] = useState("");

    return (
        <TextField
            value={value}
            onChange={(e) => setValue(e.target.value)}
            label="Text Field with Adornment"
            placeholder="Enter text"
            endAdornment={<span>@</span>}
        />
    );
}