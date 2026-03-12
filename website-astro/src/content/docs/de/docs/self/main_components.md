---
slug: de/docs/self/main_components
title: Hauptkomponenten
sidebar_label: Main Components
description: FireCMS stellt eine Reihe von steuerbaren Komponenten bereit, die das CMS-Interface aufbauen. Diese Komponenten sind so konzipiert, dass sie leicht anpassbar sind und erweitert werden können.
---

FireCMS stellt eine Reihe von stilisierbaren Komponenten bereit, die das CMS-Interface aufbauen.
Diese Komponenten sind so konzipiert, dass sie leicht angepasst und erweitert werden können. Die Hauptkomponenten sind:

### Scaffold

Das `Scaffold` ist typischerweise die oberste Komponente für eingeloggte Benutzer. Es stellt das Hauptlayout für das CMS bereit,
einschließlich der Schublade, der AppBar und des Hauptinhaltsbereichs.

#### Props:

- `autoOpenDrawer`: Schublade beim Hover öffnen.
- `logo`: Logo, das in der oberen Leiste und der Schublade angezeigt wird.
- `className`: Zusätzliche Klassen für den Scaffold.
- `style`: Zusätzliche Styles für den Scaffold.
- `children`: Die Kinder des Scaffolds (typischerweise AppBar, Drawer, NavigationRoutes, SideDialogs).

#### Beispiel:

```jsx
import { Scaffold, AppBar, Drawer, NavigationRoutes, SideDialogs } from "@firecms/core";
import logo from "./images/logo.png";
//...
return <Scaffold
    logo={logo}
    autoOpenDrawer>
    <AppBar title={"Mein CMS"}/>
    <Drawer/>
    <NavigationRoutes/>
    <SideDialogs/>
</Scaffold>
```

### AppBar

Die `AppBar` ist die obere Leiste des CMS. Sie enthält typischerweise das Logo, den Titel und das Benutzermenü.

#### Props:

- `title`: Titel, der in der AppBar angezeigt wird.
- `endAdornment`: Komponente, die auf der rechten Seite der AppBar angezeigt wird.
- `startAdornment`: Komponente, die auf der linken Seite der AppBar angezeigt wird.
- `dropDownActions`: Komponente, die als Dropdown in der AppBar angezeigt wird.
- `includeModeToggle`: Ob der Farbmodus-Umschalter (Dunkel/Hell-Modus) eingeschlossen werden soll.
- `className`: Zusätzliche Klassen für die AppBar.

### Drawer

Der `Drawer` ist das seitliche Navigationsmenü des CMS. Er zeigt die Kollektionen und Ansichten an.

### NavigationRoutes

`NavigationRoutes` rendert die Routen für die Kollektionen und Ansichten.

### SideDialogs

`SideDialogs` ist der Behälter für die seitlichen Dialoge (Entity-Formulare, Referenzauswahl-Dialoge).

#### Beispiel für vollständige App-Struktur:

```tsx
import { FireCMS, Scaffold, AppBar, Drawer, NavigationRoutes, SideDialogs } from "@firecms/core";

export function App() {
    // ...Konfigurations-Setup...

    return (
        <FireCMS
            navigationController={navigationController}
            // weitere Konfiguration
        >
            {({ context, loading }) => {
                if (loading) {
                    return <CircularProgressCenter />;
                }
                
                return (
                    <Scaffold autoOpenDrawer>
                        <AppBar title="Mein CMS" />
                        <Drawer />
                        <NavigationRoutes />
                        <SideDialogs />
                    </Scaffold>
                );
            }}
        </FireCMS>
    );
}
```
