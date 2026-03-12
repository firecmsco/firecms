---
slug: fr/docs/self/main_components
title: Composants principaux
sidebar_label: Composants principaux
description: FireCMS fournit un ensemble de composants stylisables qui constituent l'interface du CMS. Ces composants sont conçus pour être facilement personnalisables et peuvent être étendus pour répondre à vos besoins.
---

FireCMS fournit un ensemble de composants stylisables qui constituent l'interface du CMS.
Ces composants sont conçus pour être facilement personnalisables et peuvent être étendus pour répondre à vos besoins. Les composants principaux sont :

### Scaffold

Le `Scaffold` est généralement le composant de niveau supérieur pour les utilisateurs connectés. Il fournit la mise en page principale du CMS,
y compris le tiroir, la barre d'application et la zone de contenu principale.

Vous pouvez personnaliser le `Scaffold` en fournissant vos propres composants pour le tiroir, la barre d'application et la zone de contenu.
Vous pouvez également appliquer des classes au `Scaffold` pour le styliser selon vos besoins.

#### Props :

- `autoOpenDrawer` : Ouvrir le tiroir au survol.
- `logo` : Logo à afficher dans la barre supérieure et le tiroir. Notez que cela n'a aucun effet si vous utilisez une AppBar ou un Drawer personnalisé.
- `className` : Classes supplémentaires à appliquer au Scaffold.
- `style` : Styles supplémentaires à appliquer au Scaffold.
- `children` : Les enfants du Scaffold. En général, ce sont l'AppBar, le Drawer, les NavigationRoutes et les SideDialogs.

#### Exemple :

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

L'`AppBar` est la barre supérieure du CMS. Elle contient généralement le logo, le titre et le menu utilisateur.
La barre d'application par défaut inclut un avatar lié à l'utilisateur connecté.

#### Props :

- `title` : Titre à afficher dans la barre d'application.
- `endAdornment` : Composant à afficher à droite de la barre d'application.
- `startAdornment` : Composant à afficher à gauche de la barre d'application.
- `dropDownActions` : Composant à afficher comme menu déroulant dans la barre d'application. Le contenu est affiché comme enfants d'un composant `Menu`, vous utiliserez donc probablement des composants `MenuItem`.
- `includeModeToggle` : Inclure ou non le bouton de basculement de mode couleur dans la barre d'application (mode sombre/clair).
- `className` : Classes supplémentaires à appliquer à l'AppBar.
- `style` : Styles supplémentaires à appliquer à l'AppBar.
- `children` : Définissez votre propre contenu AppBar. Si vous définissez des enfants, le titre, endAdornment et dropDownActions seront ignorés.

#### Exemple :

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

#### Remplacer l'AppBar par défaut

Vous pouvez remplacer l'AppBar par défaut en enveloppant votre composant personnalisé avec `AppBar` :

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

Toutes les props passées à l'`AppBar` seront ignorées si vous définissez un composant personnalisé.

### Drawer

Le `Drawer` est le menu de gauche du CMS. Il contient généralement les routes de navigation et le menu utilisateur.
Si vous définissez un composant `Drawer`, le `Scaffold` inclura automatiquement une icône hamburger pour ouvrir et fermer le tiroir.
Si vous n'incluez pas de tiroir, l'icône hamburger ne sera pas affichée.

Le tiroir par défaut inclut les routes de navigation vers vos collections, ainsi que des liens vers les vues d'administration.

#### Props :

- `className` : Classes supplémentaires à appliquer au Drawer.
- `style` : Styles supplémentaires à appliquer au Drawer.
- `children` : Définissez votre propre contenu Drawer. Si vous définissez des enfants, les routes de navigation seront ignorées.

#### Exemple de tiroir personnalisé

Vous pouvez remplacer le Drawer par défaut en enveloppant votre composant personnalisé avec `Drawer`.
Notez que l'icône hamburger sera affichée automatiquement si vous définissez un Drawer personnalisé.

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

Le composant `NavigationRoutes` définit un composant `Routes` (`react-router-dom`) qui contient les routes vers votre
page d'accueil, collections, vues personnalisées et vues d'administration.

Il récupère automatiquement toute la configuration depuis la configuration `FireCMS`.
Notez que vous pouvez également définir vos propres routes si vous en avez besoin.

#### Props :

- `homePage` : Composant à afficher sur la page d'accueil. Si non fourni, la page d'accueil par défaut sera affichée.
- `children` : Définissez vos propres routes. Notez que ces routes seront ajoutées aux routes par défaut.

#### Exemple :

```tsx
import { NavigationRoutes } from "@firecms/core";
//...
return <NavigationRoutes homePage={<>My custom home page</>}>
    {/* Définissez vos routes personnalisées ici, en utilisant react-router */}
    <Route
        key={"navigation_admin_" + path}
        path={"invoices"}
        element={<InvoicesPage/>}
    />
</NavigationRoutes>
```

Notez que vous pouvez également définir des vues personnalisées en les définissant dans `useBuildNavigationController`, avec
l'avantage supplémentaire qu'elles seront automatiquement incluses dans le tiroir par défaut.

### SideDialogs

Le composant `SideDialogs` est un conteneur pour les dialogues latéraux. Les dialogues latéraux sont généralement utilisés pour afficher des formulaires ou
des informations supplémentaires dans un panneau latéral.

Vous pouvez accéder au hook `useSideDialogsController` pour ouvrir et fermer des dialogues latéraux programmatiquement depuis vos
composants personnalisés.


## Utilitaires

### Hook `useApp()`

Vous pouvez utiliser le hook `useApp()` pour accéder à l'objet `AppState` depuis le contexte. Cet objet contient les propriétés suivantes :

- `hasDrawer` : Si le tiroir est activé.
- `drawerHovered` : Si le tiroir est actuellement survolé.
- `drawerOpen` : Si le tiroir est actuellement ouvert.
- `openDrawer` : Fonction pour ouvrir le tiroir.
- `closeDrawer` : Fonction pour fermer le tiroir.
- `autoOpenDrawer` : Si le tiroir doit s'ouvrir au survol.
- `logo` : Logo à afficher dans la barre supérieure et le tiroir.
