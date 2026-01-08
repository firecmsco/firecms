---
id: geopoint
title: Geopoint
sidebar_label: Geopoint
---

The geopoint property is used to store geographic coordinates (latitude and
longitude pairs).

```tsx
import { buildProperty } from "./builders";

const locationProperty = buildProperty({
    name: "Location",
    description: "Geographic coordinates",
    validation: { required: true },
    dataType: "geopoint"
});
```

The geopoint field renders two number inputs for latitude and longitude with
built-in validation:
- Latitude values must be between -90 and 90
- Longitude values must be between -180 and 180
- Both values are displayed in a formatted string (e.g., "37.7749, -122.4194")

### `clearable`
Add an icon to clear the value and set it to `null`. Defaults to `false`

### `validation`

* `required` Should this field be compulsory.
* `requiredMessage` Message to be displayed as a validation error.
* `unique` Unique constraint for this value.

### Example

```tsx
import { buildCollection, buildProperty, GeoPoint } from "@firecms/core";

interface Venue {
    name: string;
    location: GeoPoint;
}

export const venuesCollection = buildCollection<Venue>({
    name: "Venues",
    singularName: "Venue",
    path: "venues",
    properties: {
        name: buildProperty({
            name: "Name",
            dataType: "string",
            validation: { required: true }
        }),
        location: buildProperty({
            name: "Location",
            description: "Geographic coordinates of the venue",
            dataType: "geopoint",
            validation: { required: true }
        })
    }
});
```

### Working with GeoPoint values

The `GeoPoint` class is exported from `@firecms/core` and can be used to create
geopoint values programmatically:

```tsx
import { GeoPoint } from "@firecms/core";

const sanFrancisco = new GeoPoint(37.7749, -122.4194);
console.log(sanFrancisco.latitude);  // 37.7749
console.log(sanFrancisco.longitude); // -122.4194
```

---

Links:
- [API](../../api/interfaces/GeopointProperty)

