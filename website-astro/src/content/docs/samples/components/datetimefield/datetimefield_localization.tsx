import React, { useState } from "react";
import { DateTimeField } from "@firecms/ui";

export default function DateTimeFieldLocalizationDemo() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    return (
        <DateTimeField
            value={selectedDate}
            onChange={setSelectedDate}
            label="Localized Date"
            mode="date"
            locale="es"
        />
    );
}
