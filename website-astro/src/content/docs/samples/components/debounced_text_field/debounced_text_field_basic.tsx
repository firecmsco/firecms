import React, { useState } from "react";
import { DebouncedTextField } from "@firecms/ui";

export default function DebouncedTextFieldBasicDemo() {
    const [value, setValue] = useState("");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValue(event.target.value);
    };

    return (
        <div>
            <DebouncedTextField
                value={value}
                onChange={handleChange}
            />
        </div>
    );
}
