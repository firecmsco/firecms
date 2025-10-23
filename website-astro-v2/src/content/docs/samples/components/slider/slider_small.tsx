import React, { useState } from "react";
import { Slider } from "@firecms/ui";

export default function SliderSmallDemo() {
    const [value, setValue] = useState([50]);

    return (
        <Slider
            value={value}
            onValueChange={setValue}
            min={0}
            size={"small"}
            max={100}
            step={1}
        />
    );
}
