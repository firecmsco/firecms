import React from 'react';
import { RadioGroup, RadioGroupItem } from "@firecms/ui";

export default function RadioGroupDisabledDemo() {
    return (
        <RadioGroup>
            <RadioGroupItem value="1">Disabled Option 1</RadioGroupItem>
            <RadioGroupItem value="2" disabled>Disabled Option 2</RadioGroupItem>
            <RadioGroupItem value="3">Disabled Option 3</RadioGroupItem>
        </RadioGroup>
    );
}
