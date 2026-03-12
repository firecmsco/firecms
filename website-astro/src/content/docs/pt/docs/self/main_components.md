---
slug: pt/docs/self/main_components
title: Componentes Principais
sidebar_label: Componentes Principais
description: O FireCMS fornece um conjunto de componentes estilizáveis que estruturam a interface do CMS. Esses componentes são projetados para serem facilmente personalizáveis e podem ser estendidos para atender às suas necessidades.
---

O FireCMS fornece um conjunto de componentes estilizáveis que estruturam a interface do CMS.
Esses componentes são projetados para serem facilmente personalizáveis e podem ser estendidos para atender às suas necessidades. Os principais componentes são:

### Scaffold

O `Scaffold` é geralmente o componente de nível superior para usuários logados. Ele fornece o layout principal para o CMS,
incluindo o drawer, a appbar e a área de conteúdo principal.

Você pode personalizar o `Scaffold` fornecendo seus próprios componentes para o drawer, appbar e área de conteúdo.
Você também pode aplicar classes ao `Scaffold` para estilizá-lo de acordo com suas necessidades.

#### Props:

- `autoOpenDrawer`: Abrir o drawer ao passar o mouse.
- `logo`: Logotipo a ser exibido na barra superior e no drawer.
  Note que isso não tem efeito se você estiver usando uma AppBar ou Drawer personalizado.
- `className`: Classes adicionais a aplicar ao Scaffold.
- `style`: Estilos adicionais a aplicar ao Scaffold.
- `children`: Os filhos do Scaffold. Normalmente, esses são AppBar, Drawer, NavigationRoutes e SideDialogs.

#### Exemplo:

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

A `AppBar` é a barra superior do CMS. Normalmente contém o logotipo, o título e o menu do usuário.
A appbar padrão inclui um avatar vinculado ao usuário logado.

#### Props:

- `title`: Título a ser exibido na appbar.
- `endAdornment`: Componente a ser exibido no lado direito da appbar.
- `startAdornment`: Componente a ser exibido no lado esquerdo da appbar.
- `dropDownActions`: Componente a ser exibido como dropdown na appbar. O conteúdo é exibido como filhos de
  um componente `Menu`, então você provavelmente vai querer usar componentes `MenuItem`.
- `includeModeToggle`: Se deve incluir o toggle de modo de cor na appbar (modo escuro/claro).
- `className`: Classes adicionais a aplicar à AppBar.
- `style`: Estilos adicionais a aplicar à AppBar.
- `children`: Defina seu próprio conteúdo da AppBar. Se você definir filhos, o título, endAdornment e dropDownActions serão
  ignorados.

#### Exemplo:

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

#### Substituindo a AppBar padrão

Você pode substituir a AppBar padrão envolvendo seu componente personalizado com a `AppBar`:

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

Todas as props passadas para a `AppBar` serão ignoradas se você definir um componente personalizado.

### Drawer

O `Drawer` é o menu do lado esquerdo do CMS. Normalmente contém as rotas de navegação e o menu do usuário.
Se você definir um componente `Drawer`, o `Scaffold` incluirá automaticamente um ícone hamburguer para abrir e fechar o
drawer.
Se você não incluir um drawer, o ícone hamburguer não será exibido.

O drawer padrão inclui as rotas de navegação para suas coleções, bem como links para as views de administração.

#### Props:

- `className`: Classes adicionais a aplicar ao Drawer.
- `style`: Estilos adicionais a aplicar ao Drawer.
- `children`: Defina seu próprio conteúdo do Drawer. Se você definir filhos, as rotas de navegação serão ignoradas.

#### Exemplo de drawer personalizado

Você pode substituir o Drawer padrão envolvendo seu componente personalizado com o `Drawer`.
Note que o ícone hamburguer será exibido automaticamente se você definir um Drawer personalizado.

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

O componente `NavigationRoutes` define um componente `Routes` (`react-router-dom`) que contém as rotas para sua
página inicial, coleções, views personalizadas e views de administração.

Ele pega toda a configuração automaticamente da configuração do `FireCMS`.
Note que você também pode definir suas próprias rotas se precisar.

#### Props:

- `homePage`: Componente a ser exibido na página inicial. Se não fornecido, a página inicial padrão será exibida.
- `children`: Defina suas próprias rotas. Note que essas rotas serão adicionadas às rotas padrão.

#### Exemplo:

```tsx
import { NavigationRoutes } from "@firecms/core";
//...
return <NavigationRoutes homePage={<>My custom home page</>}>
    {/* Defina suas rotas personalizadas aqui, usando react-router */}
    <Route
        key={"navigation_admin_" + path}
        path={"invoices"}
        element={<InvoicesPage/>}
    />
</NavigationRoutes>
```

Note que você também pode definir views personalizadas definindo-as em `useBuildNavigationController`, com o 
benefício adicional de que elas serão automaticamente incluídas no drawer padrão.

### SideDialogs

O componente `SideDialogs` é um container para diálogos laterais. Os diálogos laterais são tipicamente usados para exibir formulários ou
informações adicionais em um painel lateral.

Você pode acessar o hook `useSideDialogsController` para abrir e fechar diálogos laterais programaticamente nos seus
componentes personalizados.


## Utilitários

### Hook `useApp()`

Você pode usar o hook `useApp()` para acessar o objeto `AppState` do contexto. Este objeto contém as seguintes propriedades:

- `hasDrawer`: Se o drawer está habilitado.
- `drawerHovered`: Se o drawer está atualmente com o hover.
- `drawerOpen`: Se o drawer está atualmente aberto.
- `openDrawer`: Função para abrir o drawer.
- `closeDrawer`: Função para fechar o drawer.
- `autoOpenDrawer`: Se o drawer deve abrir ao passar o mouse.
- `logo`: Logotipo a ser exibido na barra superior e no drawer.
