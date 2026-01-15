import React, { useState } from "react";
import { DateTimeField } from "@firecms/ui";

export default function DateTimeFieldDateTimeDemo() {
    const [selectedDateTime, setSelectedDateTime] = useState<Date | undefined>(new Date());

    return (
        <DateTimeField
            value={selectedDateTime}
            onChange={setSelectedDateTime}
            label="Select date and time"
            mode="date_time"
        />
    );
}
