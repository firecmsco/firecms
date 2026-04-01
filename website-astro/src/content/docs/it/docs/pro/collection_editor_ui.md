---
slug: it/docs/pro/collection_editor
title: Collection Editor UI
---

![collection_editor.png](/img/collection_editor.png)

Questo documento descrive come utilizzare il **Plugin Collection Editor UI** con **FireCMS** per gestire e configurare le tue
collezioni Firestore. Il Plugin Collection Editor UI fornisce un'interfaccia per creare, modificare e organizzare
le collezioni, con supporto per permessi e opzioni di configurazione personalizzabili.

Tipicamente, le collezioni in FireCMS vengono definite in codice e passate come prop al `NavigationController` durante
l'inizializzazione. Il Plugin Collection Editor UI ti permette di gestire le collezioni direttamente nell'applicazione, fornendo
un modo più intuitivo e flessibile per organizzare e configurare le tue collezioni Firestore.

In questo documento vedremo come configurare e utilizzare questo plugin nella tua applicazione FireCMS.

## Installazione

Prima di tutto, assicurati di aver installato le dipendenze necessarie. Per usare il Plugin Collection Editor UI, devi avere
FireCMS e Firebase configurati nel tuo progetto.

```sh
yarn add @firecms/collection_editor
```
oppure
```sh
npm install @firecms/collection_editor
```

## Configurazione

Il plugin richiede diverse configurazioni, inclusi i controller per gestire le configurazioni delle collezioni, i permessi
e le viste personalizzate.

### Configurazione predefinita

Il Plugin Collection Editor UI si integra con il tuo backend Firestore per archiviare e gestire le configurazioni delle collezioni. Per
default, le configurazioni vengono gestite internamente, ma puoi personalizzare i percorsi e i comportamenti secondo le tue esigenze.

### Regole di sicurezza Firestore

Assicurati che le regole di sicurezza Firestore consentano al plugin di leggere e scrivere nei percorsi di configurazione. Di seguito è
riportato un esempio di regole di sicurezza che consentono agli utenti autenticati di accedere alle configurazioni delle collezioni:

```txt
match /{document=**} {
  allow read: if isFireCMSUser();
  allow write: if isFireCMSUser();
}

function isFireCMSUser(){
  return exists(/databases/$(database)/documents/__FIRECMS/config/collections/$(request.auth.uid));
}
```

## Plugin di configurazione collezioni

Il Plugin Collection Editor UI ti permette di includere un'interfaccia per modificare le configurazioni delle collezioni. Puoi scegliere dove
viene archiviata la configurazione e passarla al plugin. Il plugin include un controller che salva la
configurazione nel tuo database Firestore. Il percorso predefinito è `__FIRECMS/config/collections`.

Il controller include metodi che puoi usare nei tuoi componenti per gestire la configurazione delle collezioni.

```jsx
const collectionConfigController = useFirestoreCollectionsConfigController({
    firebaseApp
});
```

Puoi definire le tue collezioni in codice o usare l'interfaccia per definirle. È anche possibile consentire la modifica nell'
interfaccia di collezioni definite in codice. Puoi poi unire le collezioni definite in codice con quelle definite nell'interfaccia.

```jsx
import { useCallback } from "react";
import { mergeCollections } from "@firecms/collection_editor";
import { productsCollection } from "./collections/products_collection";

// Il collection builder viene passato al navigation controller
const collectionsBuilder = useCallback(() => {
    // Definisci una collezione di esempio in codice.
    const collections = [
        productsCollection
        // Le tue collezioni qui
    ];
    // Unisci le collezioni definite nel collection editor (UI) con le tue collezioni
    return mergeCollections(collections, collectionConfigController.collections ?? []);
}, [collectionConfigController.collections]);
```

Per aggiungere il Plugin Collection Editor UI, includilo nell'elenco dei plugin passati al componente `FireCMS`.

```jsx
const collectionEditorPlugin = useCollectionEditorPlugin({
    collectionConfigController
});
```

Questo aggiungerà un'icona in ogni scheda collezione che consente di modificare la configurazione della collezione.

## Utilizzo dell'hook

Il principale hook per utilizzare le funzionalità del plugin è `useCollectionEditorPlugin`. Ecco un esempio di come usarlo:

```jsx
import { useCollectionEditorPlugin } from "@firecms/collection_editor";

const collectionEditorPlugin = useCollectionEditorPlugin({
    collectionConfigController,
    configPermissions: customPermissionsBuilder,
    reservedGroups: ["admin"],
    getData: async (path, parentPaths) => {
        // Recupera e restituisci i dati per il percorso dato
        return fetchDataForPath(path, parentPaths);
    },
    getUser: (uid) => {
        // Recupera e restituisci i dati utente basandoti sull'UID
        return getUserById(uid);
    },
    onAnalyticsEvent: (event, params) => {
        // Gestisci gli eventi analytics
        logAnalyticsEvent(event, params);
    }
});
```

## Configurazione del plugin

Per integrare il Plugin Collection Editor UI in FireCMS, usa l'hook `useCollectionEditorPlugin` e passa il
plugin risultante nella configurazione di FireCMS. Questo viene tipicamente fatto nel componente principale dell'app.

### Esempio di configurazione

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
        // Definisci le tue collezioni
        const collections = [
            productsCollection,
            // Aggiungi altre collezioni qui
        ];
        // Unisci con le collezioni definite tramite la Collection Editor UI
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

## Aggiunta delle viste Collection Editor

Il Plugin Collection Editor UI fornisce viste personalizzate che devono essere aggiunte al tuo progetto FireCMS. Queste viste sono
integrate nella navigazione di FireCMS e consentono agli utenti di gestire le collezioni.

### Esempio di integrazione

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

// Includi il plugin nella configurazione FireCMS
<FireCMS
    navigationController={navigationController}
    authController={authController}
    dataSourceDelegate={firestoreDelegate}
    plugins={[userManagementPlugin, collectionEditorPlugin]}
>
    {/* I componenti della tua applicazione */}
</FireCMS>
```

## Autenticazione degli utenti

Il Plugin Collection Editor UI si integra con il tuo sistema di autenticazione per garantire che solo gli utenti autorizzati possano
gestire le collezioni. Puoi usare l'hook `useValidateAuthenticator` per autenticare gli utenti e determinarne i livelli di accesso.

### Esempio di utilizzo

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

// Renderizza la vista principale dell'applicazione
```

## Integrazione dei permessi sulle collezioni

Il Plugin Collection Editor UI include una funzione `collectionPermissions` che determina quali operazioni un utente può
eseguire in base ai suoi ruoli e alla configurazione della collezione. Questa funzione garantisce che gli utenti abbiano diritti di accesso
appropriati in tutto il progetto FireCMS.

### Esempio di integrazione

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

**Nota:** L'applicazione dei permessi a una collezione sovrascrive i permessi impostati nella configurazione della collezione.

## Gestione degli errori

Il plugin fornisce la gestione degli errori attraverso proprietà come `configError` e `collectionErrors` nell'oggetto
`CollectionEditor`. Queste possono essere usate per rilevare e visualizzare messaggi di errore durante il caricamento o la gestione delle collezioni.

### Esempio di gestione degli errori

```jsx
if (collectionEditorPlugin.configError) {
    return <ErrorDisplay error={collectionEditorPlugin.configError}/>;
}

if (collectionEditorPlugin.collectionErrors) {
    return <ErrorDisplay error={collectionEditorPlugin.collectionErrors}/>;
}
```

## Utilizzo del plugin nell'applicazione

Una volta configurato il Plugin Collection Editor UI, avrai accesso a strumenti e funzioni per gestire le tue
collezioni Firestore. Puoi accedere alle funzioni e ai dati di gestione delle collezioni tramite l'hook
`useCollectionEditorPlugin`.

### Oggetto Collection Editor

L'oggetto `collectionEditor` restituito dall'hook `useCollectionEditorPlugin` include le seguenti proprietà:

- **`loading`**: Indica se i dati della collezione sono in fase di caricamento. Valore booleano.
- **`collections`**: Array di oggetti collezione. Contiene le collezioni gestite.
- **`saveCollection`**: Funzione per persistere una collezione. Prende un oggetto `collection` e restituisce una promise che si risolve con la collezione salvata.
- **`deleteCollection`**: Funzione per eliminare una collezione. Prende un oggetto `collection` e restituisce una promise che si risolve quando la collezione viene eliminata.
- **`configError`**: Contiene qualsiasi errore verificatosi durante il caricamento delle configurazioni delle collezioni.
- **`collectionPermissions`**: Funzione che definisce i permessi per le collezioni in base ai ruoli utente e alle configurazioni delle collezioni.
- **`createCollection`**: Funzione per avviare la creazione di una nuova collezione.
- **`reservedGroups`**: Array di nomi di gruppi riservati che non possono essere usati nei nomi delle collezioni.
- **`extraView`**: Vista personalizzata aggiunta alla navigazione FireCMS per la gestione delle collezioni.
- **`defineRolesFor`**: Funzione per definire i ruoli per un dato utente, tipicamente integrata nel controller di autenticazione.
- **`authenticator`**: Opzionale. Callback authenticator costruito dalla configurazione corrente del collection editor. Consentirà l'accesso solo agli utenti con i ruoli richiesti.

### Esempio di accesso

```jsx
import { useCollectionEditorPlugin } from "@firecms/collection_editor";

const collectionEditor = useCollectionEditorPlugin({
    collectionConfigController,
    configPermissions: customPermissionsBuilder,
    reservedGroups: ["admin"]
});

// Usa le proprietà e le funzioni di collectionEditor
if (collectionEditor.loading) {
    return <LoadingIndicator/>;
}

return (
    <div>
        {collectionEditor.collections.map(collection => (
            <CollectionCard key={collection.id} collection={collection}/>
        ))}
        <Button onClick={() => collectionEditor.createCollection()}>
            Crea nuova collezione
        </Button>
    </div>
);
```

## Configurazione avanzata

### Componenti personalizzati

Puoi modificare l'interfaccia e le funzionalità del Plugin Collection Editor UI fornendo componenti UI personalizzati. Per
esempio, personalizzando il renderer del campo database:

```jsx
import CustomDatabaseFieldComponent from "./components/CustomDatabaseFieldComponent";

const collectionEditorPlugin = useCollectionEditorPlugin({
    collectionConfigController,
    components: {
        DatabaseField: CustomDatabaseFieldComponent
    }
});
```

### Builder di permessi personalizzato

Definisci una logica di permessi personalizzata per controllare cosa possono fare gli utenti nel collection editor:

```jsx
const customPermissionsBuilder = ({ user }) => ({
    createCollections: user?.isAdmin === true,
    editCollections: user?.roles.includes("editor"),
    deleteCollections: user?.isAdmin === true
});
```

## Esempio di utilizzo

Di seguito è riportato un esempio di come integrare il Plugin Collection Editor UI in un'applicazione FireCMS.

### Configurazione del plugin

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

  const title = "La mia app CMS";

  const {
    firebaseApp,
    firebaseConfigLoading,
    configError
  } = useInitialiseFirebase({
    firebaseConfig
  });

  /**
   * Controller usato per salvare la configurazione delle collezioni in Firestore.
   * Nota che questo è opzionale e puoi definire le tue collezioni in codice.
   */
  const collectionConfigController = useFirestoreCollectionsConfigController({
    firebaseApp
  });

  const collectionsBuilder = useCallback(() => {
    // Qui definiamo una collezione di esempio in codice.
    const collections = [
      productsCollection
      // Le tue collezioni qui
    ];
    // Puoi unire le collezioni definite nel collection editor (UI) con le tue collezioni
    return mergeCollections(collections, collectionConfigController.collections ?? []);
  }, [collectionConfigController.collections]);

  const signInOptions: FirebaseSignInProvider[] = ["google.com", "password"];

  /**
   * Controller usato per gestire la modalità colore scura o chiara
   */
  const modeController = useBuildModeController();

  /**
   * Delegate usato per recuperare e salvare dati in Firestore
   */
  const firestoreDelegate = useFirestoreDelegate({
    firebaseApp
  })

  /**
   * Controller usato per salvare e recuperare file nello storage
   */
  const storageSource = useFirebaseStorageSource({
    firebaseApp
  });

  /**
   * Controller per la gestione dell'autenticazione
   */
  const authController: FirebaseAuthController = useFirebaseAuthController({
    firebaseApp,
    signInOptions,
  });

  /**
   * Controller per salvare alcune preferenze utente localmente.
   */
  const userConfigPersistence = useBuildLocalConfigurationPersistence();

  /**
   * Usa l'authenticator per controllare l'accesso alla vista principale
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
