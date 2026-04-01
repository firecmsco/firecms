---
title: Componentes Principales
slug: es/docs/self/main_components
sidebar_label: Componentes Principales
description: FireCMS proporciona un conjunto de componentes con estilos que estructuran la interfaz del CMS. Estos componentes están diseñados para ser fácilmente personalizables y pueden extenderse para adaptarse a tus necesidades.
---

FireCMS proporciona un conjunto de componentes con estilos que estructuran la interfaz del CMS.
Estos componentes están diseñados para ser fácilmente personalizables y pueden extenderse para adaptarse a tus necesidades. Los componentes principales son:

### Scaffold

El `Scaffold` es normalmente el componente de nivel superior para los usuarios autenticados. Proporciona el layout principal del CMS,
incluyendo el cajón de navegación, la barra de aplicación y el área de contenido principal.

Puedes personalizar el `Scaffold` proporcionando tus propios componentes para el cajón, la barra de aplicación y el área de contenido.
También puedes aplicar clases al `Scaffold` para darle estilo según tus necesidades.

#### Props:

- `autoOpenDrawer`: Abre el cajón al pasar el ratón.
- `logo`: Logo que se mostrará en la barra superior y en el cajón.
  Ten en cuenta que esto no tiene efecto si estás usando un AppBar o Drawer personalizados.
- `className`: Clases adicionales para aplicar al Scaffold.
- `style`: Estilos adicionales para aplicar al Scaffold.
- `children`: Los hijos del Scaffold. Normalmente son AppBar, Drawer, NavigationRoutes y SideDialogs.

#### Ejemplo:

```jsx
import { Scaffold, AppBar, Drawer, NavigationRoutes, SideDialogs } from "@firecms/core";
import logo from "./images/logo.png";
//...
return <Scaffold
    logo={logo}
    autoOpenDrawer>
    <AppBar title={"Mi app CMS"}/>
    <Drawer/>
    <NavigationRoutes/>
    <SideDialogs/>
</Scaffold>
```

### AppBar

El `AppBar` es la barra superior del CMS. Normalmente contiene el logo, el título y el menú de usuario.
La barra de aplicación predeterminada incluye un avatar vinculado al usuario conectado.

#### Props:

- `title`: Título que se mostrará en la barra de aplicación.
- `endAdornment`: Componente que se mostrará en el lado derecho de la barra de aplicación.
- `startAdornment`: Componente que se mostrará en el lado izquierdo de la barra de aplicación.
- `dropDownActions`: Componente que se mostrará como dropdown en la barra de aplicación. El contenido se muestra como hijos de
  un componente `Menu`, por lo que probablemente querrás usar componentes `MenuItem`.
- `includeModeToggle`: Si incluir el botón de cambio de modo de color en la barra de aplicación (modo oscuro/claro).
- `className`: Clases adicionales para aplicar al AppBar.
- `style`: Estilos adicionales para aplicar al AppBar.
- `children`: Define tu propio contenido de AppBar. Si defines hijos, el título, endAdornment y dropDownActions serán ignorados.

#### Ejemplo:

```tsx
import { AppBar } from "@firecms/core";
import { Button, ForumIcon, LogoutIcon, MenuItem, PaymentIcon, Tooltip } from "@firecms/ui";
//...
return <AppBar title={title}
               endAdornment={<>
                   <Tooltip
                           asChild={true}
                           title={"Tu acción personalizada"}>
                       <Button variant={"outlined"}><ForumIcon size="small"/></Button>
                   </Tooltip>
               </>}
               dropDownActions={
                   <>
                       <MenuItem onClick={() => {
                           console.log("Configuración cliqueada");
                       }}>
                           <PaymentIcon size="small"/> Configuración
                       </MenuItem>
                       <MenuItem onClick={() => {
                           console.log("Cerrar sesión cliqueado");
                       }}>
                           <LogoutIcon size="small"/>
                           Cerrar sesión
                       </MenuItem>
                   </>
               }/>
```

#### Reemplazar el AppBar predeterminado

Puedes reemplazar el AppBar predeterminado envolviendo tu componente personalizado con `AppBar`:

```tsx
import { AppBar, Scaffold } from "@firecms/core";
//...
return <Scaffold>
    <AppBar>
        <div>Mi barra de aplicación personalizada</div>
    </AppBar>
    {/* ... */}
</Scaffold>
```

Todas las props pasadas al `AppBar` serán ignoradas si defines un componente personalizado.

### Drawer

El `Drawer` es el menú lateral izquierdo del CMS. Normalmente contiene las rutas de navegación y el menú de usuario.
Si defines un componente `Drawer`, el `Scaffold` incluirá automáticamente un icono de hamburguesa para abrir y cerrar el cajón.
Si no incluyes un cajón, el icono de hamburguesa no se mostrará.

El cajón predeterminado incluye las rutas de navegación a tus colecciones, así como enlaces a las vistas de administración.

#### Props:

- `className`: Clases adicionales para aplicar al Drawer.
- `style`: Estilos adicionales para aplicar al Drawer.
- `children`: Define tu propio contenido del Drawer. Si defines hijos, las rutas de navegación serán ignoradas.

#### Ejemplo de cajón personalizado

Puedes reemplazar el Drawer predeterminado envolviendo tu componente personalizado con `Drawer`.
Ten en cuenta que el icono de hamburguesa se mostrará automáticamente si defines un Drawer personalizado.

```tsx
import { Drawer, Scaffold } from "@firecms/core";
//...
return <Scaffold>
    <Drawer>
        <div>Mi cajón personalizado</div>
    </Drawer>
    {/* ... */}
</Scaffold>
```

### NavigationRoutes

El componente `NavigationRoutes` define un componente `Routes` (`react-router-dom`) que contiene las rutas a tu
página de inicio, colecciones, vistas personalizadas y vistas de administración.

Recoge toda la configuración automáticamente de la configuración de `FireCMS`.
Ten en cuenta que también puedes definir tus propias rutas si lo necesitas.

#### Props:

- `homePage`: Componente que se mostrará en la página de inicio. Si no se proporciona, se mostrará la página de inicio predeterminada.
- `children`: Define tus propias rutas. Ten en cuenta que estas rutas se añadirán a las rutas predeterminadas.

#### Ejemplo:

```tsx
import { NavigationRoutes } from "@firecms/core";
//...
return <NavigationRoutes homePage={<>Mi página de inicio personalizada</>}>
    {/* Define tus rutas personalizadas aquí, usando react-router */}
    <Route
        key={"navigation_admin_" + path}
        path={"invoices"}
        element={<InvoicesPage/>}
    />
</NavigationRoutes>
```

Ten en cuenta que también puedes definir vistas personalizadas definiéndolas en `useBuildNavigationController`, con la 
ventaja añadida de que se incluirán automáticamente en el cajón predeterminado.

### SideDialogs

El componente `SideDialogs` es un contenedor para los diálogos laterales. Los diálogos laterales se usan normalmente para mostrar formularios o
información adicional en un panel lateral.

Puedes acceder al hook `useSideDialogsController` para abrir y cerrar diálogos laterales programáticamente desde tus 
componentes personalizados.


## Utilidades

### Hook `useApp()`

Puedes usar el hook `useApp()` para acceder al objeto `AppState` desde el contexto. Este objeto contiene las siguientes propiedades:

- `hasDrawer`: Si el cajón está habilitado.
- `drawerHovered`: Si el cajón está siendo sobrevolado actualmente.
- `drawerOpen`: Si el cajón está actualmente abierto.
- `openDrawer`: Función para abrir el cajón.
- `closeDrawer`: Función para cerrar el cajón.
- `autoOpenDrawer`: Si el cajón debe abrirse al pasar el ratón.
- `logo`: Logo que se mostrará en la barra superior y en el cajón.
