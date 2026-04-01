---
slug: pt/docs/pro/collection_editor
title: Interface do Editor de Coleções
---

![collection_editor.png](/img/collection_editor.png)

Este documento descreve como usar o **Plugin de Interface do Editor de Coleções** com o **FireCMS** para gerenciar e configurar suas
coleções do Firestore. O Plugin de Interface do Editor de Coleções fornece uma interface para criar, editar e organizar
coleções, com suporte para permissões personalizáveis e opções de configuração.

Normalmente, as coleções no FireCMS são definidas no código e passadas como propriedade ao `NavigationController` na
inicialização. O Plugin de Interface do Editor de Coleções permite gerenciar coleções diretamente na aplicação, proporcionando
uma forma mais amigável e flexível de organizar e configurar suas coleções do Firestore.

Neste documento, abordaremos como configurar e usar este plugin na sua aplicação FireCMS.

## Instalação

Primeiro, certifique-se de ter instalado as dependências necessárias. Para usar o Plugin de Interface do Editor de Coleções, você precisa ter
o FireCMS e o Firebase configurados no seu projeto.

```sh
yarn add @firecms/collection_editor
```
ou
```sh
npm install @firecms/collection_editor
```

## Configuração

O plugin requer várias configurações, incluindo controladores para gerenciar configurações de coleções, permissões
e visualizações personalizadas.

### Configuração Padrão

O Plugin de Interface do Editor de Coleções integra-se com o seu backend Firestore para armazenar e gerenciar configurações de coleções. Por
padrão, as configurações são gerenciadas internamente, mas você pode personalizar caminhos e comportamentos conforme necessário.

### Regras de Segurança do Firestore

Certifique-se de que suas regras de segurança do Firestore permitem que o plugin leia e escreva nos caminhos de configuração. Abaixo está um
exemplo de regras de segurança que permitem que usuários autenticados acessem as configurações de coleções:

```txt
match /{document=**} {
  allow read: if isFireCMSUser();
  allow write: if isFireCMSUser();
}

function isFireCMSUser(){
  return exists(/databases/$(database)/documents/__FIRECMS/config/collections/$(request.auth.uid));
}
```

## Plugin de Configuração de Coleções

O Plugin de Interface do Editor de Coleções permite incluir uma interface para editar configurações de coleções. Você pode escolher onde
a configuração é armazenada e passá-la ao plugin. O plugin inclui um controlador que salva a
configuração no seu banco de dados Firestore. O caminho padrão é `__FIRECMS/config/collections`.

O controlador inclui métodos que você pode usar nos seus componentes para gerenciar a configuração de coleções.

```jsx
const collectionConfigController = useFirestoreCollectionsConfigController({
    firebaseApp
});
```

Você pode definir suas coleções no código ou usar a interface para defini-las. Também é possível permitir a modificação na
interface de coleções definidas no código. Você pode então mesclar as coleções definidas no código com aquelas definidas na interface.

```jsx
import { useCallback } from "react";
import { mergeCollections } from "@firecms/collection_editor";
import { productsCollection } from "./collections/products_collection";

// O construtor de coleções é passado ao controlador de navegação
const collectionsBuilder = useCallback(() => {
    // Defina uma coleção de exemplo no código.
    const collections = [
        productsCollection
        // Suas coleções aqui
    ];
    // Mesclar coleções definidas no editor de coleções (interface) com suas próprias coleções
    return mergeCollections(collections, collectionConfigController.collections ?? []);
}, [collectionConfigController.collections]);
```

Para adicionar o Plugin de Interface do Editor de Coleções, inclua-o na lista de plugins passados ao componente `FireCMS`.

```jsx
const collectionEditorPlugin = useCollectionEditorPlugin({
    collectionConfigController
});
```

Isso adicionará um ícone em cada cartão de coleção que permite editar a configuração da coleção.

## Uso do Hook

O principal hook para utilizar a funcionalidade do plugin é `useCollectionEditorPlugin`. Aqui está um exemplo de como usá-lo:

```jsx
import { useCollectionEditorPlugin } from "@firecms/collection_editor";

const collectionEditorPlugin = useCollectionEditorPlugin({
    collectionConfigController,
    configPermissions: customPermissionsBuilder,
    reservedGroups: ["admin"],
    getData: async (path, parentPaths) => {
        // Buscar e retornar dados para o caminho dado
        return fetchDataForPath(path, parentPaths);
    },
    getUser: (uid) => {
        // Recuperar e retornar dados do usuário com base no UID
        return getUserById(uid);
    },
    onAnalyticsEvent: (event, params) => {
        // Lidar com eventos de analytics
        logAnalyticsEvent(event, params);
    }
});
```

## Configurando o Plugin

Para integrar o Plugin de Interface do Editor de Coleções no FireCMS, use o hook `useCollectionEditorPlugin` e passe o
plugin resultante na configuração do FireCMS. Isso é normalmente feito no seu componente App principal.

### Exemplo de Configuração

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
        // Defina suas próprias coleções
        const collections = [
            productsCollection,
            // Adicione outras coleções aqui
        ];
        // Mesclar com coleções definidas via Interface do Editor de Coleções
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

## Adicionando as Visualizações do Editor de Coleções

O Plugin de Interface do Editor de Coleções fornece visualizações personalizadas que precisam ser adicionadas ao seu projeto FireCMS. Essas visualizações são
integradas à navegação do FireCMS e permitem que os usuários gerenciem coleções.

### Exemplo de Integração

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

// Inclua o plugin na sua configuração do FireCMS
<FireCMS
    navigationController={navigationController}
    authController={authController}
    dataSourceDelegate={firestoreDelegate}
    plugins={[userManagementPlugin, collectionEditorPlugin]}
>
    {/* Os componentes da sua aplicação */}
</FireCMS>
```

## Autenticando Usuários

O Plugin de Interface do Editor de Coleções integra-se com o seu sistema de autenticação para garantir que apenas usuários autorizados possam
gerenciar coleções. Você pode usar o hook `useValidateAuthenticator` para autenticar usuários e determinar seus níveis de
acesso.

### Exemplo de Uso

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

// Renderize sua visualização principal da aplicação
```

## Integrando Permissões de Coleções

O Plugin de Interface do Editor de Coleções inclui uma função `collectionPermissions` que determina quais operações um usuário pode
realizar com base em seus papéis e na configuração da coleção. Esta função garante que os usuários tenham direitos de acesso
apropriados em todo o seu projeto FireCMS.

### Exemplo de Integração

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

**Nota:** Aplicar permissões a uma coleção substitui as permissões definidas na configuração da coleção.

## Tratamento de Erros

O plugin fornece tratamento de erros através de propriedades como `configError` e `collectionErrors` no
objeto `CollectionEditor`. Estas podem ser usadas para detectar e exibir mensagens de erro ao carregar ou gerenciar coleções.

### Exemplo de Tratamento de Erros

```jsx
if (collectionEditorPlugin.configError) {
    return <ErrorDisplay error={collectionEditorPlugin.configError}/>;
}

if (collectionEditorPlugin.collectionErrors) {
    return <ErrorDisplay error={collectionEditorPlugin.collectionErrors}/>;
}
```

## Usando o Plugin na sua Aplicação

Uma vez configurado o Plugin de Interface do Editor de Coleções, você terá acesso a ferramentas e funções para gerenciar suas
coleções do Firestore. Você pode acessar as funções e dados de gerenciamento de coleções através do
hook `useCollectionEditorPlugin`.

### Objeto do Editor de Coleções

O objeto `collectionEditor` retornado pelo hook `useCollectionEditorPlugin` inclui as seguintes propriedades:

- **`loading`**: Indica se os dados da coleção estão sendo carregados. Valor booleano.
- **`collections`**: Array de objetos de coleção. Contém as coleções sendo gerenciadas.
- **`saveCollection`**: Função para persistir uma coleção. Recebe um objeto `collection` e retorna uma promise resolvendo
  com a coleção salva.
- **`deleteCollection`**: Função para excluir uma coleção. Recebe um objeto `collection` e retorna uma promise resolvendo
  quando a coleção é excluída.
- **`configError`**: Contém qualquer erro que ocorreu ao carregar configurações de coleções.
- **`collectionPermissions`**: Função que define as permissões para coleções com base nos papéis do usuário e configurações
  de coleções.
- **`createCollection`**: Função para iniciar a criação de uma nova coleção.
- **`reservedGroups`**: Array de nomes de grupos que são reservados e não podem ser usados em nomes de coleções.
- **`extraView`**: Visualização personalizada adicionada à navegação do FireCMS para gerenciamento de coleções.
- **`defineRolesFor`**: Função para definir papéis para um determinado usuário, normalmente integrada ao seu controlador de autenticação.
- **`authenticator`**: Opcional. Callback de autenticador construído a partir da configuração atual do editor de coleções.
  Só permitirá acesso a usuários com os papéis necessários.

### Exemplo de Acesso

```jsx
import { useCollectionEditorPlugin } from "@firecms/collection_editor";

const collectionEditor = useCollectionEditorPlugin({
    collectionConfigController,
    configPermissions: customPermissionsBuilder,
    reservedGroups: ["admin"]
});

// Use as propriedades e funções do collectionEditor
if (collectionEditor.loading) {
    return <LoadingIndicator/>;
}

return (
    <div>
        {collectionEditor.collections.map(collection => (
            <CollectionCard key={collection.id} collection={collection}/>
        ))}
        <Button onClick={() => collectionEditor.createCollection()}>
            Criar Nova Coleção
        </Button>
    </div>
);
```

## Configuração Avançada

### Componentes Personalizados

Você pode modificar a interface e funcionalidade do Plugin de Interface do Editor de Coleções fornecendo componentes de interface personalizados. Por
exemplo, personalizando o renderizador do campo de banco de dados:

```jsx
import CustomDatabaseFieldComponent from "./components/CustomDatabaseFieldComponent";

const collectionEditorPlugin = useCollectionEditorPlugin({
    collectionConfigController,
    components: {
        DatabaseField: CustomDatabaseFieldComponent
    }
});
```

### Construtor de Permissões Personalizado

Defina uma lógica de permissões personalizada para controlar o que os usuários podem fazer dentro do editor de coleções:

```jsx
const customPermissionsBuilder = ({ user }) => ({
    createCollections: user?.isAdmin === true,
    editCollections: user?.roles.includes("editor"),
    deleteCollections: user?.isAdmin === true
});
```

## Exemplo de Uso

Abaixo está um exemplo de como integrar o Plugin de Interface do Editor de Coleções em uma aplicação FireCMS.

### Configuração do Plugin

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

  const title = "My CMS app";

  const {
    firebaseApp,
    firebaseConfigLoading,
    configError
  } = useInitialiseFirebase({
    firebaseConfig
  });

  /**
   * Controlador usado para salvar a configuração de coleções no Firestore.
   * Note que isso é opcional e você pode definir suas coleções no código.
   */
  const collectionConfigController = useFirestoreCollectionsConfigController({
    firebaseApp
  });

  const collectionsBuilder = useCallback(() => {
    // Aqui definimos uma coleção de exemplo no código.
    const collections = [
      productsCollection
      // Suas coleções aqui
    ];
    // Você pode mesclar coleções definidas no editor de coleções (interface) com suas próprias coleções
    return mergeCollections(collections, collectionConfigController.collections ?? []);
  }, [collectionConfigController.collections]);

  const signInOptions: FirebaseSignInProvider[] = ["google.com", "password"];

  /**
   * Controlador usado para gerenciar o modo de cor escuro ou claro
   */
  const modeController = useBuildModeController();

  /**
   * Delegado usado para buscar e salvar dados no Firestore
   */
  const firestoreDelegate = useFirestoreDelegate({
    firebaseApp
  })

  /**
   * Controlador usado para salvar e buscar arquivos no armazenamento
   */
  const storageSource = useFirebaseStorageSource({
    firebaseApp
  });

  /**
   * Controlador para gerenciamento de autenticação
   */
  const authController: FirebaseAuthController = useFirebaseAuthController({
    firebaseApp,
    signInOptions,
  });

  /**
   * Controlador para salvar algumas preferências do usuário localmente.
   */
  const userConfigPersistence = useBuildLocalConfigurationPersistence();

  /**
   * Use o autenticador para controlar o acesso à visualização principal
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
