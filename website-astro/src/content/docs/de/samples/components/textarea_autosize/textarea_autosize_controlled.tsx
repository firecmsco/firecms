import React, { useState } from "react";
import { TextareaAutosize } from "@firecms/ui";

export default function TextareaAutosizeControlledDemo() {
    const [value, setValue] = useState("Controlled textarea");

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(event.target.value);
    };

    return (
        <TextareaAutosize 
            value={value}
            onChange={handleChange}
            placeholder="Type your text here..."
        />
    );
}