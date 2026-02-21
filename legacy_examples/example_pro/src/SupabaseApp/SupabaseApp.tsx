import React from "react";

import "typeface-rubik";
import "@fontsource/jetbrains-mono";

import {
    AppBar,
    CircularProgressCenter,
    Drawer,
    FireCMS,
    ModeControllerProvider,
    NavigationRoutes,
    Scaffold,
    SideDialogs,
    SnackbarProvider,
    useBuildLocalConfigurationPersistence,
    useBuildModeController,
    useBuildNavigationController
} from "@firecms/core";
import { createClient } from "@supabase/supabase-js";
import { useSupabaseAuthController } from "./useSupabaseAuthController";
import { useSupabaseDelegate } from "./useSupabaseDataSourceDelegate";
import { productsCollection } from "./collections/products_collection";

const NEXT_PUBLIC_SUPABASE_URL = "https://aqgwxulqziwzfzxkbhau.supabase.co"
const NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxZ3d4dWxxeml3emZ6eGtiaGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUwNjU2NTcsImV4cCI6MjA0MDY0MTY1N30.NwtGlIkzoGGOJprGIfCQ-Ps_ZS5tevB2OFDtBlgrgBE"

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)


function SupabaseApp() {

    const name = "My FireCMS App";

    /**
     * Controller used to manage the dark or light color mode
     */
    const modeController = useBuildModeController();

    /**
     * Controller for saving some user preferences locally.
     */
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    const authController = useSupabaseAuthController({
        supabase
    });

    const supabaseDataSourceDelegate = useSupabaseDelegate({ supabase });

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
    //     dataSourceDelegate: supbaseDataSourceDelegate,
    //     storageSource
    // });

    const navigationController = useBuildNavigationController({
        collections: [productsCollection],
        authController,
        dataSourceDelegate: supabaseDataSourceDelegate
    });

    // if (firebaseConfigLoading || !firebaseApp) {
    //     return <>
    //         <CircularProgressCenter/>
    //     </>;
    // }

    // if (configError) {
    //     return <CenteredView>{configError}</CenteredView>;
    // }

    return (
        <SnackbarProvider>
            <ModeControllerProvider value={modeController}>

                <FireCMS
                    navigationController={navigationController}
                    authController={authController}
                    userConfigPersistence={userConfigPersistence}
                    dataSourceDelegate={supabaseDataSourceDelegate}
                    // @ts-ignore
                    storageSource={null}
                >
                    {({
                          context,
                          loading
                      }) => {

                        let component;
                        if (loading) {
                            component = <CircularProgressCenter size={"large"}/>;
                        } else {
                            // if (!canAccessMainView) {
                            //     component = (
                            //         <MongoLoginView
                            //             allowSkipLogin={false}
                            //             authController={authController}
                            //             registrationEnabled={true}
                            //             notAllowedError={notAllowedError}/>
                            //     );
                            // } else {
                            component = (
                                <Scaffold
                                    autoOpenDrawer={false}>
                                    <AppBar
                                        title={name}/>
                                    <Drawer/>
                                    <NavigationRoutes/>
                                    <SideDialogs/>
                                </Scaffold>
                            );
                            // }
                        }

                        return component;
                    }}
                </FireCMS>
            </ModeControllerProvider>
        </SnackbarProvider>
    );
}

export default SupabaseApp;
