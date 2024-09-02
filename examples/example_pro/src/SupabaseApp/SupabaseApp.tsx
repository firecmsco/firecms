import React from "react";

import "typeface-rubik";
import "@fontsource/jetbrains-mono";

import {
    AppBar,
    CircularProgressCenter,
    DataSourceDelegate,
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

import { useFirebaseStorageSource, useInitialiseFirebase, } from "@firecms/firebase";

import { productsCollection } from "./collections/products_collection";
import { CenteredView } from "@firecms/ui";
import { createClient } from "@supabase/supabase-js";

const NEXT_PUBLIC_SUPABASE_URL="https://aqgwxulqziwzfzxkbhau.supabase.co"
const NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxZ3d4dWxxeml3emZ6eGtiaGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUwNjU2NTcsImV4cCI6MjA0MDY0MTY1N30.NwtGlIkzoGGOJprGIfCQ-Ps_ZS5tevB2OFDtBlgrgBE"

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function getProducts() {
    const { data } = await supabase.from("Products").select();
    console.log(data);
}

getProducts();
function SupabaseApp() {

    return "Yo";
    // const name = "My FireCMS App";
    //
    // const {
    //     firebaseApp,
    //     firebaseConfigLoading,
    //     configError
    // } = useInitialiseFirebase({
    //     firebaseConfig
    // });
    //
    // const { app } = useInitRealmMongodb(atlasConfig);
    //
    // /**
    //  * Controller used to manage the dark or light color mode
    //  */
    // const modeController = useBuildModeController();
    //
    // /**
    //  * Controller for saving some user preferences locally.
    //  */
    // const userConfigPersistence = useBuildLocalConfigurationPersistence();
    //
    // const authController: MongoAuthController = useMongoDBAuthController({
    //     app
    // });
    //
    // const cluster = "mongodb-atlas"
    // const database = "todo"
    //
    // const mongoDataSourceDelegate = useMongoDBDelegate({
    //     app,
    //     cluster,
    //     database
    // });
    //
    // /**
    //  * Controller used for saving and fetching files in storage
    //  */
    // const storageSource = useFirebaseStorageSource({
    //     firebaseApp
    // });
    //
    // /**
    //  * Validate authenticator
    //  */
    // const {
    //     authLoading,
    //     canAccessMainView,
    //     notAllowedError
    // } = useValidateAuthenticator({
    //     authController,
    //     authenticator: () => true,
    //     dataSourceDelegate: mongoDataSourceDelegate,
    //     storageSource
    // });
    //
    // const navigationController = useBuildNavigationController({
    //     collections: [productsCollection],
    //     authController,
    //     dataSourceDelegate: mongoDataSourceDelegate
    // });
    //
    // if (firebaseConfigLoading || !firebaseApp) {
    //     return <>
    //         <CircularProgressCenter/>
    //     </>;
    // }
    //
    // if (configError) {
    //     return <CenteredView>{configError}</CenteredView>;
    // }
    //
    // return (
    //     <SnackbarProvider>
    //         <ModeControllerProvider value={modeController}>
    //
    //             <FireCMS
    //                 navigationController={navigationController}
    //                 authController={authController}
    //                 userConfigPersistence={userConfigPersistence}
    //                 dataSourceDelegate={mongoDataSourceDelegate}
    //                 storageSource={storageSource}
    //
    //             >
    //                 {({
    //                       context,
    //                       loading
    //                   }) => {
    //
    //                     let component;
    //                     if (loading || authLoading) {
    //                         component = <CircularProgressCenter size={"large"}/>;
    //                     } else {
    //                         if (!canAccessMainView) {
    //                             component = (
    //                                 <MongoLoginView
    //                                     allowSkipLogin={false}
    //                                     authController={authController}
    //                                     registrationEnabled={true}
    //                                     notAllowedError={notAllowedError}/>
    //                             );
    //                         } else {
    //                             component = (
    //                                 <Scaffold
    //                                     autoOpenDrawer={false}>
    //                                     <AppBar
    //                                         title={name}/>
    //                                     <Drawer/>
    //                                     <NavigationRoutes/>
    //                                     <SideDialogs/>
    //                                 </Scaffold>
    //                             );
    //                         }
    //                     }
    //
    //                     return component;
    //                 }}
    //             </FireCMS>
    //         </ModeControllerProvider>
    //     </SnackbarProvider>
    // );
}

export default SupabaseApp;
