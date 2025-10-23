---
slug: docs/self/main_components
title: Main Components
sidebar_label: Main Components
description: FireCMS provides a set of stylable components that scaffold the CMS interface. These components are designed to be easily customizable and can be extended to fit your needs.
---

FireCMS provides a set of stylable components that scaffold the CMS interface.
These components are designed to be easily customizable and can be extended to fit your needs. The main components are:

### Scaffold

The `Scaffold` is typically the top level component for logged-in users. It provides the main layout for the CMS,
including the drawer, the appbar, and the main content area.

You can customize the `Scaffold` by providing your own components for the drawer, appbar, and content area.
You can also apply classes to the `Scaffold` to style it according to your needs.

#### Props:

- `autoOpenDrawer`: Open the drawer on hover.
- `logo`: Logo to be displayed in the top bar and drawer.
  Note that this has no effect if you are using a custom AppBar or Drawer.
- `className`: Additional classes to apply to the Scaffold.
- `style`: Additional styles to apply to the Scaffold.
- `children`: The children of the Scaffold. Typically, these are the AppBar, Drawer, NavigationRoutes, and SideDialogs.

#### Example:

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

The `AppBar` is the top bar of the CMS. It typically contains the logo, the title, and the user menu.
The default appbar includes an avatar tied to the logged-user.

#### Props:

- `title`: Title to be displayed in the appbar.
- `endAdornment`: Component to be displayed on the right side of the appbar.
- `startAdornment`: Component to be displayed on the left side of the appbar.
- `dropDownActions`: Component to be displayed as a dropdown in the appbar. The content is displayed as children of
  a `Menu` component, so you will likely want to use `MenuItem` components.
- `includeModeToggle`: Whether to include the color mode toggle in the appbar (dark/light mode).
- `className`: Additional classes to apply to the AppBar.
- `style`: Additional styles to apply to the AppBar.
- `children`: Define your own AppBar content. If you define children, the title, endAdornment, and dropDownActions will be
  ignored.

#### Example:

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

#### Replace the default AppBar

You can replace the default AppBar by wrapping your custom component with the `AppBar`:

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

All the props passed to the `AppBar` will be ignored if you define a custom component.

### Drawer

The `Drawer` is the left-side menu of the CMS. It typically contains the navigation routes and the user menu.
If you define a `Drawer` component, the `Scaffold` will automatically include a hamburger icon to open and close the
drawer.
If you don't include a drawer, the hamburger icon will not be displayed.

The default drawer includes the navigation routes to your collections, as well as links to the admin views.

#### Props:

- `className`: Additional classes to apply to the Drawer.
- `style`: Additional styles to apply to the Drawer.
- `children`: Define your own Drawer content. If you define children, the navigation routes will be ignored.

#### Custom drawer example

You can replace the default Drawer by wrapping your custom component with the `Drawer`.
Note that the burger icon will be displayed automatically if you define a custom Drawer.

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

The `NavigationRoutes` component defines a `Routes` component (`react-router-dom`) that contains the routes to your
home page, collections, custom views and admin views.

It picks up all the configuration automatically from the `FireCMS` configuration.
Note that you can also define your own routes if you need to.

#### Props:

- `homePage`: Component to be displayed in the home page. If not provided, the default home page will be displayed.
- `children`: Define your own routes. Note that these routes will be appended to the default routes.

#### Example:

```tsx
import { NavigationRoutes } from "@firecms/core";
//...
return <NavigationRoutes homePage={<>My custom home page</>}>
    {/* Define your custom routes here, using react-router */}
    <Route
        key={"navigation_admin_" + path}
        path={"invoices"}
        element={<InvoicesPage/>}
    />
</NavigationRoutes>
```

Note that you can also define custom views by defining them in `useBuildNavigationController`, with the 
added benefit that they will be automatically included in the default drawer.

### SideDialogs

The `SideDialogs` component is a container for side dialogs. Side dialogs are typically used to display forms or
additional information in a side panel.

You can access the `useSideDialogsController` hook to open and close side dialogs programmatically from your 
custom components.


## Utilities

### `useApp()` hook

You can use the `useApp()` hook to access the `AppState` object from the context. This object contains the following properties:

- `hasDrawer`: Whether the drawer is enabled.
- `drawerHovered`: Whether the drawer is currently hovered.
- `drawerOpen`: Whether the drawer is currently open.
- `openDrawer`: Function to open the drawer.
- `closeDrawer`: Function to close the drawer.
- `autoOpenDrawer`: Whether the drawer should open on hover.
- `logo`: Logo to be displayed in the top bar and drawer.


