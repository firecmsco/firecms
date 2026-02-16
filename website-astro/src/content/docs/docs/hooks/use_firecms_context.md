---
slug: docs/hooks/use_firecms_context
title: useFireCMSContext
sidebar_label: useFireCMSContext
---

Get the context that includes the internal controllers and contexts used by the app.
Some controllers and context included in this context can be accessed
directly from their respective hooks.

The props provided by this hook are:

* `dataSource`: Connector to your database, e.g. your Firestore database

* `storageSource`: Used storage implementation

* `navigation`: Context that includes the resolved navigation and utility methods and
  attributes.

* `sideEntityController`: Controller to open the side dialog displaying entity forms

* `sideDialogsController`: Controller used to open side dialogs (used internally by
  side entity dialogs or reference dialogs)

* `dialogsController`: Controller used to open regular dialogs

* `authController`: Used auth controller

* `customizationController`: Controller holding the customization options for the CMS

* `snackbarController`: Use this controller to display snackbars

* `userConfigPersistence`: Use this controller to access data stored in the browser for the user

* `analyticsController`: Callback to send analytics events (optional)

* `userManagement`: Section used to manage users in the CMS. Used to show user info
  in various places and assign entity ownership.

Example:

```tsx
import React from "react";
import { useFireCMSContext } from "@firecms/core";

export function ExampleCMSView() {

    const context = useFireCMSContext();

    // Access the data source
    const dataSource = context.dataSource;

    // Open a snackbar
    context.snackbarController.open({
        type: "success",
        message: "Example message"
    });

    return <div>Example view</div>;
}
```
