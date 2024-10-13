import React, { useState } from "react";
import { Slider } from "@firecms/ui";

export default function SliderBasicDemo() {
    const [value, setValue] = useState([50]);

    return (
        <Slider
            value={value}
            onValueChange={setValue}
            min={0}
            max={100}
            step={1}
        />
    );
}