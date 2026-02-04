---
slug: docs/hooks/use_analytics_controller
title: useAnalyticsController
sidebar_label: useAnalyticsController
description: Hook to access the analytics controller and listen to CMS events.
---

Hook to access the analytics controller. This controller allows you to listen to internal events in the CMS, such as navigation, entity creation, editing, etc.

You can use this to integrate with 3rd party analytics providers like Google Analytics, Mixpanel, or Segment.

### Usage

```tsx
import { useAnalyticsController } from "@firecms/core";
import { useEffect } from "react";

export function MyAnalyticsComponent() {
    const analyticsController = useAnalyticsController();

    useEffect(() => {
        // You would typically set this up in your main app entry point
        // This is just for demonstration
        console.log("Analytics controller available");
    }, [analyticsController]);

    return null;
}
```

### Interface

```tsx
export type AnalyticsController = {
    /**
     * Callback used to get analytics events from the CMS
     */
    onAnalyticsEvent?: (event: CMSAnalyticsEvent, data?: object) => void;
}
```

### Events

The `CMSAnalyticsEvent` type defines all the possible events:

* `entity_click`: User clicked on an entity in a collection
* `edit_entity_clicked`: User clicked the edit button
* `new_entity_click`: User clicked the "New" button
* `new_entity_saved`: A new entity was successfully created
* `entity_edited`: An entity was updated
* `entity_deleted`: An entity was deleted
* `drawer_navigate_to_collection`: User navigated to a collection from the drawer
* `home_navigate_to_collection`: User navigated to a collection from the home page
* ... and more.
