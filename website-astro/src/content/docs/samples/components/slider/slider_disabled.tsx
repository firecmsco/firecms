import React from "react";
import { Slider } from "@rebasepro/ui";

export default function SliderDisabledDemo() {
    return (
        <Slider
            value={[30]}
            min={0}
            max={100}
            disabled
        />
    );
}