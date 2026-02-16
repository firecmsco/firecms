import React, { useState } from "react";
import { DateTimeField } from "@firecms/ui";

export default function DateTimeFieldBasicDemo() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    return (
        <DateTimeField
            value={selectedDate}
            onChange={setSelectedDate}
            label="Select a date"
            mode="date"
        />
    );
}
