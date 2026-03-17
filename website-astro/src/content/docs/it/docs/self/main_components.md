---
title: Componenti principali
sidebar_label: Componenti principali
description: FireCMS fornisce un set di componenti stilizzabili che costruiscono l'interfaccia CMS. Questi componenti sono progettati per essere facilmente personalizzabili.
---

FireCMS fornisce un set di componenti stilizzabili che costruiscono l'interfaccia CMS. Questi componenti sono progettati per essere facilmente personalizzabili e possono essere estesi per soddisfare le tue esigenze. I componenti principali sono:

### Scaffold

Lo `Scaffold` è tipicamente il componente di primo livello per gli utenti connessi. Fornisce il layout principale per il CMS, incluso il drawer, l'appbar e l'area di contenuto principale.

Puoi personalizzare lo `Scaffold` fornendo i tuoi componenti per il drawer, l'appbar e l'area di contenuto. Puoi anche applicare classi allo `Scaffold` per stilizzarlo secondo le tue esigenze.

#### Props:

- `autoOpenDrawer`: Apri il drawer al passaggio del mouse.
- `logo`: Logo da visualizzare nella barra superiore e nel drawer.
- `className`: Classi aggiuntive da applicare allo Scaffold.
- `style`: Stili aggiuntivi da applicare allo Scaffold.
- `children`: I figli dello Scaffold. Tipicamente, sono AppBar, Drawer, NavigationRoutes e SideDialogs.

#### Esempio:

```jsx
import { Scaffold, AppBar, Drawer, NavigationRoutes, SideDialogs } from "@firecms/core";
import logo from "./images/logo.png";
//...
return <Scaffold
    logo={logo}
    autoOpenDrawer>
    <AppBar title={"My CMS app"}/>
    <Drawer/>
    <NavigationRoutes/>
    <SideDialogs/>
</Scaffold>
```

### AppBar

L'`AppBar` è la barra superiore del CMS. Contiene tipicamente il logo, il titolo e il menu utente. L'appbar predefinita include un avatar legato all'utente connesso.

#### Props:

- `title`: Titolo da visualizzare nell'appbar.
- `endAdornment`: Componente da visualizzare sul lato destro dell'appbar.
- `startAdornment`: Componente da visualizzare sul lato sinistro dell'appbar.
- `dropDownActions`: Componente da visualizzare come dropdown nell'appbar.
- `includeModeToggle`: Se includere il toggle modalità colore nell'appbar (modalità dark/light).
- `className`: Classi aggiuntive da applicare all'AppBar.
- `style`: Stili aggiuntivi da applicare all'AppBar.
- `children`: Definisci il tuo contenuto AppBar personalizzato.

#### Esempio:

```tsx
import { AppBar } from "@firecms/core";
import { Button, ForumIcon, LogoutIcon, MenuItem, PaymentIcon, Tooltip } from "@firecms/ui";
//...
return <AppBar title={title}
               endAdornment={<>
                   <Tooltip
                           asChild={true}
                           title={"Your custom action"}>
                       <Button variant={"outlined"}><ForumIcon size="small"/></Button>
                   </Tooltip>
               </>}
               dropDownActions={
                   <>
                       <MenuItem onClick={() => {
                           console.log("Settings clicked");
                       }}>
                           <PaymentIcon size="small"/> Settings
                       </MenuItem>
                       <MenuItem onClick={() => {
                           console.log("Logout clicked");
                       }}>
                           <LogoutIcon size="small"/>
                           Logout
                       </MenuItem>
                   </>
               }/>
```

#### Sostituire l'AppBar predefinita

Puoi sostituire l'AppBar predefinita avvolgendo il tuo componente personalizzato con l'`AppBar`:

```tsx
import { AppBar, Scaffold } from "@firecms/core";
//...
return <Scaffold>
    <AppBar>
        <div>My custom appbar</div>
    </AppBar>
    {/* ... */}
</Scaffold>
```

### Drawer

Il `Drawer` è il menu laterale sinistro del CMS. Contiene tipicamente le route di navigazione e il menu utente.
Se definisci un componente `Drawer`, lo `Scaffold` includerà automaticamente un'icona hamburger per aprire e chiudere il drawer.

Il drawer predefinito include le route di navigazione alle tue collezioni, oltre ai link alle viste admin.

#### Props:

- `className`: Classi aggiuntive da applicare al Drawer.
- `style`: Stili aggiuntivi da applicare al Drawer.
- `children`: Definisci il tuo contenuto Drawer personalizzato.

#### Esempio drawer personalizzato

```tsx
import { Drawer, Scaffold } from "@firecms/core";
//...
return <Scaffold>
    <Drawer>
        <div>My custom drawer</div>
    </Drawer>
    {/* ... */}
</Scaffold>
```

### NavigationRoutes

Il componente `NavigationRoutes` definisce un componente `Routes` (`react-router-dom`) che contiene le route alla home page, alle collezioni, alle viste personalizzate e alle viste admin.

Raccoglie automaticamente tutta la configurazione dal `FireCMS`.

#### Props:

- `homePage`: Componente da visualizzare nella home page. Se non fornito, verrà visualizzata la home page predefinita.
- `children`: Definisci le tue route. Queste route verranno aggiunte alle route predefinite.

#### Esempio:

```tsx
import { NavigationRoutes } from "@firecms/core";
//...
return <NavigationRoutes homePage={<>My custom home page</>}>
    {/* Definisci le tue route personalizzate qui, usando react-router */}
    <Route
        key={"navigation_admin_" + path}
        path={"invoices"}
        element={<InvoicesPage/>}
    />
</NavigationRoutes>
```

### SideDialogs

Il componente `SideDialogs` è un contenitore per i dialoghi laterali. I dialoghi laterali sono tipicamente usati per visualizzare form o informazioni aggiuntive in un pannello laterale.

Puoi accedere all'hook `useSideDialogsController` per aprire e chiudere i dialoghi laterali a livello di codice dai tuoi componenti personalizzati.


## Utility

### Hook `useApp()`

Puoi usare l'hook `useApp()` per accedere all'oggetto `AppState` dal context. Questo oggetto contiene le seguenti proprietà:

- `hasDrawer`: Se il drawer è abilitato.
- `drawerHovered`: Se il drawer è attualmente in hover.
- `drawerOpen`: Se il drawer è attualmente aperto.
- `openDrawer`: Funzione per aprire il drawer.
- `closeDrawer`: Funzione per chiudere il drawer.
- `autoOpenDrawer`: Se il drawer deve aprirsi al passaggio del mouse.
- `logo`: Logo da visualizzare nella barra superiore e nel drawer.
