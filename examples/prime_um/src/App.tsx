import React, { useCallback } from "react";
import { useImportExportPlugin } from "@firecms/data_import_export";

import logo from "../images/primeum_logo.png";
import { User as FirebaseUser } from "firebase/auth";
import { Authenticator, FireCMSProApp } from "@firecms/firebase_pro";

import "typeface-rubik";
import "@fontsource/ibm-plex-mono";

import { firebaseConfig } from "./firebase-config";
import { clientsCollection } from "./collections/clients";
import { shareOfShelfCollection } from "./collections/shelves";
import { ShareOfShelfQueryView } from "./views/ShareOfShelfQueryView";

export default function App() {
    console.log("App")

    const myAuthenticator: Authenticator<FirebaseUser> = useCallback(async ({
                                                                                user,
                                                                                authController,
                                                                                dataSourceDelegate
                                                                            }) => {

        if (!user?.email) {
            throw Error("The user has no email");
        }

        const cmsUser = await dataSourceDelegate.fetchEntity({ path: "__cms_users", entityId: user.email })
        if (!cmsUser) {
            throw Error("This user is not allowed login to PrimeUm");
        }

        console.log("Allowing access to", user?.email);

        return true;
    }, []);

    const importExportPlugin = useImportExportPlugin();

    // const dataEnhancementPlugin = useDataEnhancementPlugin({
    //     // Paths that will be enhanced
    //     getConfigForPath: ({ path }) => {
    //         return true;
    //     }
    // });

    return <FireCMSProApp
        name={"Prime um"}
        plugins={[importExportPlugin]}
        signInOptions={["google.com", "password"]}
        authentication={myAuthenticator}
        logo={logo}
        collections={[
            {
                ...shareOfShelfCollection,
                collectionGroup: true
            },
            clientsCollection
        ]}
        views={[
            {
                path: "new_shelf_query",
                name: "New share of shelf query",
                group: "Shelf Queries",
                icon: "query_stats",
                view: <ShareOfShelfQueryView/>
            }
        ]}
        firebaseConfig={firebaseConfig}
    />;
}

// import React, { useCallback } from "react";
//
// import { useImportExportPlugin } from "@firecms/data_import_export";
//
// import logo from "../images/primeum_logo.png";
// import { User as FirebaseUser } from "firebase/auth";
// import {
//     CenteredView
// } from "@firecms/ui";
// import {
//     CircularProgressCenter,
//     FireCMS,
//     ModeControllerProvider,
//     NavigationRoutes,
//     Scaffold,
//     SideDialogs,
//     SnackbarProvider,
//     useBuildLocalConfigurationPersistence,
//     useBuildModeController,
//     useBuildNavigationController,
// } from "@firecms/core";
// import {
//     Authenticator,
//     FirebaseAuthController,
//     FirebaseSignInProvider,
//     useFirebaseAuthController,
//     useFirebaseStorageSource,
//     useFirestoreDelegate,
//     useInitialiseFirebase,
//     useInitializeAppCheck,
//     useValidateAuthenticator
// } from "@firecms/firebase";
// import { FirebaseLoginView } from "@firecms/firebase_pro";
//
// import "typeface-rubik";
// import "@fontsource/ibm-plex-mono";
//
// import { clientsCollection } from "./collections/clients";
// import { shareOfShelfCollection } from "./collections/shelves";
// import { ShareOfShelfQueryView } from "./views/ShareOfShelfQueryView";
// import { deleteCollection } from "./collections/delete";
// import { BrowserRouter } from "react-router-dom";
// import "@fontsource/roboto"
//
// import { firebaseConfig } from "./firebase-config";
//
// function App() {
//     return <BrowserRouter>
//         <AppInner/>
//     </BrowserRouter>
// }
//
// function AppInner() {
//
//     console.log("AppInner")
//
//     const name = "Prime-UM";
//
//     const myAuthenticator: Authenticator<FirebaseUser> = useCallback(async ({
//                                                                                 user,
//                                                                                 authController,
//                                                                                 dataSourceDelegate
//                                                                             }) => {
//
//         if (!user?.email) {
//             throw Error("The user has no email");
//         }
//
//         const cmsUser = await dataSourceDelegate.fetchEntity({ path: "__cms_users", entityId: user.email })
//         if (!cmsUser) {
//             throw Error("This user is not allowed login to PrimeUm");
//         }
//
//         console.log("Allowing access to", user?.email);
//
//         return true;
//     }, []);
//
//     const importExportPlugin = useImportExportPlugin();
//
//     const {
//         firebaseApp,
//         firebaseConfigLoading,
//         configError
//     } = useInitialiseFirebase({
//         firebaseConfig
//     });
//
//     /**
//      * Controller used to manage the dark or light color mode
//      */
//     const modeController = useBuildModeController();
//
//     const {
//         appCheckLoading,
//         getAppCheckToken
//     } = useInitializeAppCheck({
//         firebaseApp,
//     });
//
//     const signInOptions: FirebaseSignInProvider[] = ["google.com", "password"];
//     /**
//      * Controller for managing authentication
//      */
//     const authController: FirebaseAuthController = useFirebaseAuthController({
//         firebaseApp,
//         signInOptions
//     });
//
//     /**
//      * Controller for saving some user preferences locally.
//      */
//     const userConfigPersistence = useBuildLocalConfigurationPersistence();
//
//     const firestoreDelegate = useFirestoreDelegate({
//         firebaseApp
//     })
//
//     /**
//      * Controller used for saving and fetching files in storage
//      */
//     const storageSource = useFirebaseStorageSource({
//         firebaseApp
//     });
//
//     /**
//      * Validate authenticator
//      */
//     const {
//         authLoading,
//         canAccessMainView,
//         notAllowedError
//     } = useValidateAuthenticator({
//         authController,
//         authentication: myAuthenticator,
//         getAppCheckToken,
//         dataSourceDelegate: firestoreDelegate,
//         storageSource
//     });
//
//     const navigationController = useBuildNavigationController({
//         collections: [
//             {
//                 ...shareOfShelfCollection,
//                 collectionGroup: true
//             },
//             clientsCollection,
//             deleteCollection
//         ],
//         views: [
//             {
//                 path: "new_shelf_query",
//                 name: "New share of shelf query",
//                 group: "Shelf Queries",
//                 icon: "query_stats",
//                 view: <ShareOfShelfQueryView/>
//             }
//         ],
//         authController,
//         dataSourceDelegate: firestoreDelegate
//     });
//
//     if (firebaseConfigLoading || !firebaseApp || appCheckLoading) {
//         return <>
//             <CircularProgressCenter/>
//         </>;
//     }
//
//     if (configError) {
//         return <CenteredView>{configError}</CenteredView>;
//     }
//
//     return (
//         <SnackbarProvider>
//             <ModeControllerProvider value={modeController}>
//
//                 <FireCMS
//                     navigationController={navigationController}
//                     authController={authController}
//                     userConfigPersistence={userConfigPersistence}
//                     dataSourceDelegate={firestoreDelegate}
//                     storageSource={storageSource}
//                     plugins={[importExportPlugin]}
//                 >
//                     {({
//                           context,
//                           loading
//                       }) => {
//
//                         let component;
//                         if (loading || authLoading) {
//                             component = <CircularProgressCenter size={"large"}/>;
//                         } else {
//                             if (!canAccessMainView) {
//                                 const LoginViewUsed = FirebaseLoginView;
//                                 component = (
//                                     <LoginViewUsed
//                                         logo={logo}
//                                         allowSkipLogin={false}
//                                         signInOptions={signInOptions}
//                                         firebaseApp={firebaseApp}
//                                         authController={authController}
//                                         notAllowedError={notAllowedError}/>
//                                 );
//                             } else {
//                                 component = (
//                                     <Scaffold
//                                         logo={logo}
//                                         name={name}
//                                         fireCMSAppBarProps={{
//                                             endAdornment: <div>Project select here</div>
//                                         }}
//                                         autoOpenDrawer={false}>
//                                         <NavigationRoutes/>
//                                         <SideDialogs/>
//                                     </Scaffold>
//                                 );
//                             }
//                         }
//
//                         return component;
//                     }}
//                 </FireCMS>
//             </ModeControllerProvider>
//         </SnackbarProvider>
//     );
// }
//
// export default App;

