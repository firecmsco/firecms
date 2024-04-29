import React from "react";

// @ts-ignore
import pricePreview from "@site/static/img/price.png";

// @ts-ignore
import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Panel } from "../general/Panel";
import clsx from "clsx";
import { ContainerInnerPaddingMixin, CTAButtonMixin, CTACaret, CTAOutlinedButtonMixin, defaultBorderMixin } from "../styles";
import LightingIcon from "@site/static/img/icons/lighting.svg";


// developer features:
// - use all the internal hooks
// - use all the internal components
// - use all the internal controllers
// - use all the internal plugins
// - use custom data sources, storage and auth
export function ProDeveloperFeatures() {

    return (<>

            <Panel color={"gray"} includeMargin={false} includePadding={false}>
                <p className={clsx("text-center text-secondary uppercase font-mono font-bold border-0 border-b", ContainerInnerPaddingMixin, defaultBorderMixin)}>
                    For developers
                </p>

                <div
                    className={"max-w-6xl w-full mx-auto md:col-span-9 md:pr-8 flex justify-center flex-col h-full mb-16"}>


                    <div className={"flex items-center mb-4 mt-16"}>

                        {/*<div*/}
                        {/*    className="flex items-center justify-center text-white w-10 h-10 gradient-bg rounded-full shadow flex-shrink-0 mr-3">*/}
                        {/*    <LightingIcon height={12} width={12}/>*/}
                        {/*</div>*/}

                        <h3 className="h2 m-0 uppercase font-mono">
                            No config, just React components
                        </h3>

                    </div>
                    <p className="text-xl md:text-2xl ">
                        FireCMS is simply a set of React components and hooks. You can use them to build your own
                        back-office applications, with your own authentication, data sources and storage.
                    </p>

                    <p className="text-xl ">
                        No need to learn a new framework or a new way of doing things. Just use the components and hooks
                        you need. No magic, no hidden logic, no configuration.
                    </p>

                    <div className={"space-y-4 space-x-4"}>
                        <a
                            className={CTAOutlinedButtonMixin + " w-fit"}
                            href="https://demo.firecms.co"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            Try the demo
                            <CTACaret/>
                        </a>

                        <a
                            className={CTAButtonMixin + "  "}
                            href={"https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0INW8ihjQ90S4gkdo8_rbL_Zx7gagZShLIpHyW43zDXkQDPole6a1coo1sT2O6Gl05X8lxFDlp?gv=true"}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            Book a meeting
                        </a>
                    </div>

                    <SyntaxHighlighter
                        className={clsx("mt-16 p-4 overflow-x-auto md:max-w-full overflow-y-hidden border border-solid", defaultBorderMixin)}
                        language={"typescript"}
                        showLineNumbers={false}
                        style={dracula}
                    >
                        {proExampleCode}
                    </SyntaxHighlighter>

                </div>


            </Panel>
        </>
    );
}

const proExampleCode = `function ProSample() {

    // Use your own authentication logic here
    const myAuthenticator: Authenticator<FirebaseUserWrapper> = useCallback(async ({
                                                                                user,
                                                                                authController
                                                                            }) => {

        if (user?.email?.includes("flanders")) {
            throw Error("Stupid Flanders!");
        }

        // This is an example of retrieving async data related to the user
        // and storing it in the controller's extra field
        const idTokenResult = await user?.getIdTokenResult();
        const userIsAdmin = idTokenResult?.claims.admin || user?.email?.endsWith("@firecms.co");

        console.log("Allowing access to", user);
        return Boolean(userIsAdmin);
    }, []);

    const collections = [
        booksCollection,
        // Your collections here
    ];

    const {
        firebaseApp,
        firebaseConfigLoading,
        configError
    } = useInitialiseFirebase({
        firebaseConfig
    });

    // Controller used to manage the dark or light color mode
    const modeController = useBuildModeController();

    const signInOptions: FirebaseSignInProvider[] = ["google.com"];

    // Controller for managing authentication
    const authController: FirebaseAuthController = useFirebaseAuthController({
        firebaseApp,
        signInOptions
    });

    // Controller for saving some user preferences locally.
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    // Delegate used for fetching and saving data in Firestore
    const firestoreDelegate = useFirestoreDelegate({
        firebaseApp
    });

    // Controller used for saving and fetching files in storage
    const storageSource = useFirebaseStorageSource({
        firebaseApp
    });

    const navigationController = useBuildNavigationController({
        collections,
        authController,
        dataSourceDelegate: firestoreDelegate
    });

    const dataEnhancementPlugin = useDataEnhancementPlugin({
        getConfigForPath: ({ path }) => {
            if (path === "books")
                return true;
            return false;
        }
    });

    const importExportPlugin = useImportExportPlugin();

    if (firebaseConfigLoading || !firebaseApp) {
        return <>
            <CircularProgressCenter/>
        </>;
    }

    if (configError) {
        return <CenteredView>{configError}</CenteredView>;
    }
    return (
        <SnackbarProvider>
            <ModeControllerProvider value={modeController}>
                <FireCMS
                    navigationController={navigationController}
                    authController={authController}
                    userConfigPersistence={userConfigPersistence}
                    dataSourceDelegate={firestoreDelegate}
                    storageSource={storageSource}
                    plugins={[dataEnhancementPlugin, importExportPlugin]}
                >
                    {({
                          context,
                          loading
                      }) => {

                        if (loading) {
                            return <CircularProgressCenter size={"large"}/>;
                        }
                        if (authController.user === null) {
                            return <FirebaseLoginView authController={authController}
                                                      firebaseApp={firebaseApp}
                                                      signInOptions={signInOptions}/>
                        }

                        return <Scaffold
                            name={"My demo app"}
                            autoOpenDrawer={false}>
                            <NavigationRoutes/>
                            <SideDialogs/>
                        </Scaffold>;
                    }}
                </FireCMS>
            </ModeControllerProvider>
        </SnackbarProvider>
    );

}`;

