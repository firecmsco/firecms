import React from "react";
import { Chip, Select, SelectItem } from "@firecms/ui";

const beverages = {
    coffee: "Coffee",
    tea: "Tea",
    juice: "Juice",
    soda: "Soda",
    water: "Water"
}

export default function SelectCustomDemo() {
    const [selected, setSelected] = React.useState("");

    return (
        <Select
            value={selected}
            onValueChange={setSelected}
            size="small"
            className="w-[400px] bg-yellow-200 dark:bg-yellow-800"
            inputClassName="custom-input-class"
            placeholder="Select your drinks"
            renderValue={(value) => {
                return <Chip key={value}>{beverages[value]}</Chip>;
            }}
        >
            {Object.entries(beverages).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                    {label}
                </SelectItem>
            ))}
        </Select>
    );
}
