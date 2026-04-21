# DateTimeField


DateTimeField is a versatile component allowing users to easily select dates and times. It can be configured for various modes such as date only or date-time selection, and it supports localization.

## Usage

`DateTimeField` component can be used to capture date or date-time values from users. It supports customization for disabling the field, clearing the selection, displaying errors, and more.

## Basic Usage

Provides a basic date-picker functionality where users can select a date.

```tsx
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

```

## Date-Time Selection

Enables selection of both date and time, suitable for scenarios where precise timing is crucial.

```tsx
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

```

## Localization

Showcases how to localize the DateTimeField component, adjusting it for different locales.

```tsx
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

```

