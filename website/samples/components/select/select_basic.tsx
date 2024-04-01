import React from "react";
import { Select, SelectItem } from "@firecms/ui";

export default function SelectBasicDemo() {
    const [selected, setSelected] = React.useState<string>();

    return (
        <Select
            value={selected}
            onValueChange={setSelected}
            placeholder={<i>Select a character</i>}
            renderValue={(value) => {
                if (value === "homer") {
                    return "Homer";
                } else if (value === "marge") {
                    return "Marge";
                } else if (value === "bart") {
                    return "Bart";
                } else if (value === "lisa") {
                    return "Lisa";
                }
                throw new Error("Invalid value");
            }}
        >
            <SelectItem value="homer">Homer</SelectItem>
            <SelectItem value="marge">Marge</SelectItem>
            <SelectItem value="bart">Bart</SelectItem>
            <SelectItem value="lisa">Lisa</SelectItem>
        </Select>
    );
}
