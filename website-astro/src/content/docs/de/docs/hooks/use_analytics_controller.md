---
title: useAnalyticsController
sidebar_label: useAnalyticsController
---

Hook für den Zugriff auf den Analytics-Controller. Verwenden Sie diesen Hook, um Analytics-Ereignisse in Ihrer FireCMS-Anwendung zu senden.

### Verwendung

```tsx
import { useAnalyticsController } from "@firecms/core";

export function ExampleView() {
    const analyticsController = useAnalyticsController();
    
    const handleAction = () => {
        analyticsController?.onAnalyticsEvent?.("button_clicked", {
            label: "example_button"
        });
    };
    
    return <button onClick={handleAction}>Aktion ausführen</button>;
}
```
