---
slug: es/docs/pro/collection_editor
title: Interfaz del Editor de Colecciones
---

![collection_editor.png](/img/collection_editor.png)

Este documento describe cómo usar el **Plugin de Interfaz del Editor de Colecciones** con **FireCMS** para gestionar y configurar tus
colecciones de Firestore. El Plugin de Interfaz del Editor de Colecciones proporciona una interfaz para crear, editar y organizar
colecciones, con soporte para permisos personalizables y opciones de configuración.

Normalmente, las colecciones en FireCMS se definen en código y se pasan como prop al `NavigationController` durante la
inicialización. El Plugin de Interfaz del Editor de Colecciones te permite gestionar colecciones directamente en la aplicación, proporcionando
una forma más amigable y flexible de organizar y configurar tus colecciones de Firestore.

En este documento, cubriremos cómo configurar y usar este plugin en tu aplicación FireCMS.

## Instalación

Primero, asegúrate de haber instalado las dependencias necesarias. Para usar el Plugin de Interfaz del Editor de Colecciones, necesitas tener
FireCMS y Firebase configurados en tu proyecto.

```sh
yarn add @firecms/collection_editor
```
o
```sh
npm install @firecms/collection_editor
```

## Configuración

El plugin requiere varias configuraciones, incluyendo controladores para gestionar configuraciones de colecciones, permisos
y vistas personalizadas.

### Configuración Predeterminada

El Plugin de Interfaz del Editor de Colecciones se integra con tu backend de Firestore para almacenar y gestionar las configuraciones de colecciones. Por
defecto, las configuraciones se gestionan internamente, pero puedes personalizar las rutas y comportamientos según sea necesario.

### Reglas de Seguridad de Firestore

Asegúrate de que tus reglas de seguridad de Firestore permitan al plugin leer y escribir en las rutas de configuración. A continuación se muestra un
ejemplo de reglas de seguridad que permiten a los usuarios autenticados acceder a las configuraciones de colecciones:

```txt
match /{document=**} {
  allow read: if isFireCMSUser();
  allow write: if isFireCMSUser();
}

function isFireCMSUser(){
  return exists(/databases/$(database)/documents/__FIRECMS/config/collections/$(request.auth.uid));
}
```

## Plugin de Configuración de Colecciones

El Plugin de Interfaz del Editor de Colecciones te permite incluir una interfaz de usuario para editar las configuraciones de colecciones. Puedes elegir dónde
se almacena la configuración y pasarla al plugin. El plugin incluye un controlador que guarda la
configuración en tu base de datos Firestore. La ruta predeterminada es `__FIRECMS/config/collections`.

El controlador incluye métodos que puedes usar en tus componentes para gestionar la configuración de colecciones.

```jsx
const collectionConfigController = useFirestoreCollectionsConfigController({
    firebaseApp
});
```

Puedes definir tus colecciones en código o usar la interfaz para definirlas. También es posible permitir la modificación en
la interfaz de las colecciones definidas en código. Luego puedes fusionar las colecciones definidas en código con las definidas en la interfaz.

```jsx
import { useCallback } from "react";
import { mergeCollections } from "@firecms/collection_editor";
import { productsCollection } from "./collections/products_collection";

// El constructor de colecciones se pasa al controlador de navegación
const collectionsBuilder = useCallback(() => {
    // Define una colección de muestra en código.
    const collections = [
        productsCollection
        // Tus colecciones aquí
    ];
    // Fusiona las colecciones definidas en el editor de colecciones (UI) con tus propias colecciones
    return mergeCollections(collections, collectionConfigController.collections ?? []);
}, [collectionConfigController.collections]);
```

Para añadir el Plugin de Interfaz del Editor de Colecciones, inclúyelo en la lista de plugins pasados al componente `FireCMS`.

```jsx
const collectionEditorPlugin = useCollectionEditorPlugin({
    collectionConfigController
});
```

Esto añadirá un icono en cada tarjeta de colección que te permite editar la configuración de la colección.

## Uso del Hook

El hook principal para usar la funcionalidad del plugin es `useCollectionEditorPlugin`. A continuación se muestra un ejemplo de cómo usarlo:

```jsx
import { useCollectionEditorPlugin } from "@firecms/collection_editor";

const collectionEditorPlugin = useCollectionEditorPlugin({
    collectionConfigController,
    configPermissions: customPermissionsBuilder,
    reservedGroups: ["admin"],
    getData: async (path, parentPaths) => {
        // Obtiene y devuelve datos para la ruta dada
        return fetchDataForPath(path, parentPaths);
    },
    getUser: (uid) => {
        // Recupera y devuelve datos de usuario según el UID
        return getUserById(uid);
    },
    onAnalyticsEvent: (event, params) => {
        // Gestiona eventos de analítica
        logAnalyticsEvent(event, params);
    }
});
```

## Configuración del Plugin

Para integrar el Plugin de Interfaz del Editor de Colecciones en FireCMS, usa el hook `useCollectionEditorPlugin` y pasa el
plugin resultante a la configuración de FireCMS. Normalmente esto se hace en tu componente principal App.

### Ejemplo de Configuración

```jsx
import React, { useCallback } from "react";
import { FireCMS, useBuildNavigationController } from "@firecms/core";
import { mergeCollections, useCollectionEditorPlugin } from "@firecms/collection_editor";
import { useFirestoreCollectionsConfigController } from "@firecms/collection_editor_firebase";
import {
    useFirebaseAuthController,
    useFirestoreDelegate,
    useInitialiseFirebase,
    useValidateAuthenticator
} from "@firecms/firebase";
import { useBuildUserManagement, userManagementAdminViews, useUserManagementPlugin } from "@firecms/user_management";
import { productsCollection } from "./collections/products_collection";
import { customPermissionsBuilder } from "./config/permissions";
import { CustomCollectionView } from "./views/CustomCollectionView";
import { CollectionIcon } from "./components/CollectionIcon";

function App() {
    const {
        firebaseApp,
        firebaseConfigLoading,
        configError
    } = useInitialiseFirebase({
        firebaseConfig
    });

    const firestoreDelegate = useFirestoreDelegate({
        firebaseApp
    });

    const authController = useFirebaseAuthController({
        firebaseApp,
        signInOptions: ["google.com", "password"]
    });

    const collectionConfigController = useFirestoreCollectionsConfigController({
        firebaseApp
    });

    const collectionEditorPlugin = useCollectionEditorPlugin({
        collectionConfigController,
        configPermissions: customPermissionsBuilder,
        reservedGroups: ["admin"],
        extraView: {
            View: CustomCollectionView,
            icon: <CollectionIcon/>
        }
    });

    const userManagement = useBuildUserManagement({
        dataSourceDelegate: firestoreDelegate,
        authController: authController
    });

    const userManagementPlugin = useUserManagementPlugin({ userManagement });

    const collectionsBuilder = useCallback(() => {
        // Define tus propias colecciones
        const collections = [
            productsCollection,
            // Añade otras colecciones aquí
        ];
        // Fusiona con las colecciones definidas mediante la Interfaz del Editor de Colecciones
        return mergeCollections(collections, collectionConfigController.collections ?? []);
    }, [collectionConfigController.collections]);

    const plugins = [
        collectionEditorPlugin,
        userManagementPlugin
    ];
    
    const navigationController = useBuildNavigationController({
        collections: collectionsBuilder(),
        views: customViews,
        adminViews: userManagementAdminViews,
        collectionPermissions: collectionEditorPlugin.collectionPermissions,
        authController,
        dataSourceDelegate: firestoreDelegate,
        plugins
    });

    const {
        authLoading,
        canAccessMainView,
        notAllowedError
    } = useValidateAuthenticator({
        disabled: collectionEditorPlugin.loading,
        authController: authController,
        authenticator: customAuthenticator,
        dataSourceDelegate: firestoreDelegate,
        storageSource
    });

    if (firebaseConfigLoading) {
        return <LoadingIndicator/>;
    }

    if (configError) {
        return <ErrorDisplay error={configError}/>;
    }

    return (
        <FireCMS
            navigationController={navigationController}
            authController={authController}
            dataSourceDelegate={firestoreDelegate}
        >
            {({
                  context,
                  loading
              }) => {
                if (loading || authLoading) {
                    return <LoadingSpinner/>;
                }
                if (!canAccessMainView) {
                    return <AccessDenied message={notAllowedError}/>;
                }
                return <MainAppLayout/>;
            }}
        </FireCMS>
    );
}

export default App;
```

## Añadir las Vistas del Editor de Colecciones

El Plugin de Interfaz del Editor de Colecciones proporciona vistas personalizadas que deben añadirse a tu proyecto FireCMS. Estas vistas se
integran en la navegación de FireCMS y permiten a los usuarios gestionar colecciones.

### Ejemplo de Integración

```jsx
import { useCollectionEditorPlugin } from "@firecms/collection_editor";

const collectionEditorPlugin = useCollectionEditorPlugin({
    collectionConfigController,
    configPermissions: customPermissionsBuilder,
    reservedGroups: ["admin"],
    extraView: {
        View: CustomCollectionView,
        icon: <CollectionIcon/>
    }
});

// Incluye el plugin en tu configuración de FireCMS
<FireCMS
    navigationController={navigationController}
    authController={authController}
    dataSourceDelegate={firestoreDelegate}
    plugins={[userManagementPlugin, collectionEditorPlugin]}
>
    {/* Los componentes de tu aplicación */}
</FireCMS>
```

## Autenticación de Usuarios

El Plugin de Interfaz del Editor de Colecciones se integra con tu sistema de autenticación para garantizar que solo los usuarios autorizados puedan
gestionar colecciones. Puedes usar el hook `useValidateAuthenticator` para autenticar usuarios y determinar sus niveles de acceso.

### Ejemplo de Uso

```jsx
import { useValidateAuthenticator } from "@firecms/core";

const {
    authLoading,
    canAccessMainView,
    notAllowedError
} = useValidateAuthenticator({
    disabled: collectionEditorPlugin.loading,
    authController: authController,
    authenticator: customAuthenticator,
    dataSourceDelegate: firestoreDelegate,
    storageSource: storageSource
});

if (authLoading) {
    return <LoadingIndicator/>;
}

if (!canAccessMainView) {
    return <AccessDeniedError message={notAllowedError}/>;
}

// Renderiza tu vista principal de aplicación
```

## Integración de Permisos de Colección

El Plugin de Interfaz del Editor de Colecciones incluye una función `collectionPermissions` que determina qué operaciones puede
realizar un usuario según sus roles y la configuración de la colección. Esta función garantiza que los usuarios tengan los derechos de acceso adecuados en todo tu proyecto FireCMS.

### Ejemplo de Integración

```jsx
const navigationController = useBuildNavigationController({
    collections: customCollections,
    views: customViews,
    adminViews: userManagementAdminViews,
    collectionPermissions: collectionEditorPlugin.collectionPermissions,
    authController,
    dataSourceDelegate: firestoreDelegate
});
```

**Nota:** Aplicar permisos a una colección anula los permisos establecidos en la configuración de la colección.

## Manejo de Errores

El plugin proporciona manejo de errores a través de propiedades como `configError` y `collectionErrors` en el
objeto `CollectionEditor`. Pueden usarse para detectar y mostrar mensajes de error al cargar o gestionar colecciones.

### Ejemplo de Manejo de Errores

```jsx
if (collectionEditorPlugin.configError) {
    return <ErrorDisplay error={collectionEditorPlugin.configError}/>;
}

if (collectionEditorPlugin.collectionErrors) {
    return <ErrorDisplay error={collectionEditorPlugin.collectionErrors}/>;
}
```

## Uso del Plugin en Tu Aplicación

Una vez que hayas configurado el Plugin de Interfaz del Editor de Colecciones, tendrás acceso a herramientas y funciones para gestionar tus
colecciones de Firestore. Puedes acceder a las funciones y datos de gestión de colecciones a través del
hook `useCollectionEditorPlugin`.

### Objeto del Editor de Colecciones

El objeto `collectionEditor` devuelto por el hook `useCollectionEditorPlugin` incluye las siguientes propiedades:

- **`loading`**: Indica si los datos de la colección están siendo cargados. Valor booleano.
- **`collections`**: Array de objetos de colección. Contiene las colecciones que se están gestionando.
- **`saveCollection`**: Función para persistir una colección. Recibe un objeto `collection` y devuelve una promesa que resuelve con la colección guardada.
- **`deleteCollection`**: Función para eliminar una colección. Recibe un objeto `collection` y devuelve una promesa que resuelve cuando la colección es eliminada.
- **`configError`**: Contiene cualquier error ocurrido al cargar las configuraciones de colección.
- **`collectionPermissions`**: Función que define los permisos para las colecciones según los roles del usuario y las configuraciones de colección.
- **`createCollection`**: Función para iniciar la creación de una nueva colección.
- **`reservedGroups`**: Array de nombres de grupos que están reservados y no pueden usarse en los nombres de colecciones.
- **`extraView`**: Vista personalizada añadida a la navegación de FireCMS para la gestión de colecciones.
- **`defineRolesFor`**: Función para definir roles para un usuario dado, normalmente integrada en tu controlador de autenticación.
- **`authenticator`**: Opcional. Callback de autenticación construido desde la configuración actual del editor de colecciones. Solo permitirá acceso a usuarios con los roles requeridos.

### Ejemplo de Acceso

```jsx
import { useCollectionEditorPlugin } from "@firecms/collection_editor";

const collectionEditor = useCollectionEditorPlugin({
    collectionConfigController,
    configPermissions: customPermissionsBuilder,
    reservedGroups: ["admin"]
});

// Usa las propiedades y funciones de collectionEditor
if (collectionEditor.loading) {
    return <LoadingIndicator/>;
}

return (
    <div>
        {collectionEditor.collections.map(collection => (
            <CollectionCard key={collection.id} collection={collection}/>
        ))}
        <Button onClick={() => collectionEditor.createCollection()}>
            Crear Nueva Colección
        </Button>
    </div>
);
```

## Configuración Avanzada

### Componentes Personalizados

Puedes modificar la interfaz y la funcionalidad del Plugin de Interfaz del Editor de Colecciones proporcionando componentes de interfaz personalizados. Por
ejemplo, personalizando el renderizador del campo de base de datos:

```jsx
import CustomDatabaseFieldComponent from "./components/CustomDatabaseFieldComponent";

const collectionEditorPlugin = useCollectionEditorPlugin({
    collectionConfigController,
    components: {
        DatabaseField: CustomDatabaseFieldComponent
    }
});
```

### Constructor de Permisos Personalizado

Define una lógica de permisos personalizada para controlar lo que los usuarios pueden hacer dentro del editor de colecciones:

```jsx
const customPermissionsBuilder = ({ user }) => ({
    createCollections: user?.isAdmin === true,
    editCollections: user?.roles.includes("editor"),
    deleteCollections: user?.isAdmin === true
});
```

## Ejemplo de Uso Completo

A continuación se muestra un ejemplo de cómo integrar el Plugin de Interfaz del Editor de Colecciones en una aplicación FireCMS.

### Configuración del Plugin

```jsx
import React, { useCallback, useMemo } from "react";

import "typeface-rubik";
import "@fontsource/jetbrains-mono";
import {
  AppBar,
  CircularProgressCenter,
  CMSView,
  Drawer,
  FireCMS,
  ModeControllerProvider,
  NavigationRoutes,
  Scaffold,
  SideDialogs,
  SnackbarProvider,
  useBuildLocalConfigurationPersistence,
  useBuildModeController,
  useBuildNavigationController,
  useValidateAuthenticator
} from "@firecms/core";
import {
  FirebaseAuthController,
  FirebaseLoginView,
  FirebaseSignInProvider,
  useFirebaseAuthController,
  useFirebaseStorageSource,
  useFirestoreDelegate,
  useInitialiseFirebase
} from "@firecms/firebase";
import { useFirestoreCollectionsConfigController } from "@firecms/collection_editor_firebase";
import { mergeCollections, useCollectionEditorPlugin } from "@firecms/collection_editor";

import { firebaseConfig } from "./firebase_config";
import { productsCollection } from "./collections/products";

export function App() {

  const title = "Mi app CMS";

  const {
    firebaseApp,
    firebaseConfigLoading,
    configError
  } = useInitialiseFirebase({
    firebaseConfig
  });

  /**
   * Controlador usado para guardar la configuración de colecciones en Firestore.
   * Ten en cuenta que esto es opcional y puedes definir tus colecciones en código.
   */
  const collectionConfigController = useFirestoreCollectionsConfigController({
    firebaseApp
  });

  const collectionsBuilder = useCallback(() => {
    // Aquí definimos una colección de muestra en código.
    const collections = [
      productsCollection
      // Tus colecciones aquí
    ];
    // Puedes fusionar colecciones definidas en el editor de colecciones (UI) con tus propias colecciones
    return mergeCollections(collections, collectionConfigController.collections ?? []);
  }, [collectionConfigController.collections]);

  const signInOptions: FirebaseSignInProvider[] = ["google.com", "password"];

  /**
   * Controlador usado para gestionar el modo de color oscuro o claro
   */
  const modeController = useBuildModeController();

  /**
   * Delegado usado para obtener y guardar datos en Firestore
   */
  const firestoreDelegate = useFirestoreDelegate({
    firebaseApp
  })

  /**
   * Controlador usado para guardar y obtener archivos en almacenamiento
   */
  const storageSource = useFirebaseStorageSource({
    firebaseApp
  });

  /**
   * Controlador para gestionar la autenticación
   */
  const authController: FirebaseAuthController = useFirebaseAuthController({
    firebaseApp,
    signInOptions,
  });

  /**
   * Controlador para guardar algunas preferencias del usuario localmente.
   */
  const userConfigPersistence = useBuildLocalConfigurationPersistence();

  /**
   * Usa el autenticador para controlar el acceso a la vista principal
   */
  const {
    authLoading,
    canAccessMainView,
    notAllowedError
  } = useValidateAuthenticator({
    authController,
    dataSourceDelegate: firestoreDelegate,
    storageSource
  });

  const navigationController = useBuildNavigationController({
    collections: collectionsBuilder,
    authController,
    dataSourceDelegate: firestoreDelegate
  });

  const collectionEditorPlugin = useCollectionEditorPlugin({
    collectionConfigController
  });

  if (firebaseConfigLoading || !firebaseApp) {
    return <CircularProgressCenter/>;
  }

  if (configError) {
    return <>{configError}</>;
  }

  return (
          <SnackbarProvider>
            <ModeControllerProvider value={modeController}>

              <FireCMS
                      apiKey={import.meta.env.VITE_FIRECMS_API_KEY}
                      navigationController={navigationController}
                      authController={authController}
                      userConfigPersistence={userConfigPersistence}
                      dataSourceDelegate={firestoreDelegate}
                      storageSource={storageSource}
                      plugins={[
                        collectionEditorPlugin
                      ]}
              >
                {({
                    context,
                    loading
                  }) => {

                  let component;
                  if (loading || authLoading) {
                    component = <CircularProgressCenter size={"large"}/>;
                  } else {
                    if (!canAccessMainView) {
                      component = (
                              <FirebaseLoginView
                                      allowSkipLogin={false}
                                      signInOptions={signInOptions}
                                      firebaseApp={firebaseApp}
                                      authController={authController}
                                      notAllowedError={notAllowedError}/>
                      );
                    } else {
                      component = (
                              <Scaffold
                                      // logo={...}
                                      autoOpenDrawer={false}>
                                <AppBar title={title}/>
                                <Drawer/>
                                <NavigationRoutes/>
                                <SideDialogs/>
                              </Scaffold>
                      );
                    }
                  }

                  return component;
                }}
              </FireCMS>
            </ModeControllerProvider>
          </SnackbarProvider>
  );
}
```

