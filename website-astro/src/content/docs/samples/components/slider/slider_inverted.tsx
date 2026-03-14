import React, { useState } from "react";
import { Slider } from "@rebasepro/ui";

export default function SliderInvertedDemo() {
    const [value, setValue] = useState([70]);

    return (
        <Slider
            value={value}
            onValueChange={setValue}
            min={0}
            max={100}
            inverted
        />
    );
}