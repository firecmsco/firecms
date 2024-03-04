import React from "react";

// @ts-ignore
import pricePreview from "@site/static/img/price.png";

// @ts-ignore
import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Panel } from "../general/Panel";
import clsx from "clsx";
import { ContainerInnerPaddingMixin, CTACaret, CTAOutlinedButtonMixin, defaultBorderMixin } from "../styles";
import LightingIcon from "@site/static/img/icons/lighting.svg";

export function ProDeveloperFeatures() {

    return (<>
            <Panel color={"gray"} includeMargin={false} includePadding={false}>

                <p className={clsx("text-center text-secondary uppercase font-mono font-bold border-0 border-b", ContainerInnerPaddingMixin, defaultBorderMixin)}>
                    For developers
                </p>

                {/*                <TwoColumns*/}
                {/*                    reverseSmall={true}*/}
                {/*                    animation={false}*/}
                {/*                    className={"p-8"}*/}
                {/*                    left={<div*/}
                {/*                        className="relative flex-col font-mono">*/}

                {/*                        <SyntaxHighlighter*/}
                {/*                            className={clsx("p-4 max-w-xs overflow-x-auto sm:max-w-full overflow-y-hidden border border-solid", defaultBorderMixin)}*/}
                {/*                            language={"typescript"}*/}
                {/*                            showLineNumbers={false}*/}
                {/*                            wrapLines={true}*/}
                {/*                            style={dracula}*/}
                {/*                        >*/}
                {/*                            {`const firestoreDelegate = useFirestoreDelegate({*/}
                {/*    firebaseApp,*/}
                {/*    localTextSearchEnabled: false,*/}
                {/*    textSearchControllerBuilder: myAlgoliaSearchControllerBuilder*/}
                {/*});*/}

                {/*const firestoreDelegate = useFirebaseRTDBDelegate({*/}
                {/*    firebaseApp*/}
                {/*});*/}

                {/*const mongoDBDelegate = useMongoDataSource({*/}
                {/*    mongoDBApp,*/}
                {/*    cluster: "my-cluster",*/}
                {/*    database: "my-database",*/}
                {/*});`}*/}
                {/*                        </SyntaxHighlighter>*/}
                {/*                    </div>*/}
                {/*                    }*/}
                {/*                    right={<div className="p-8">*/}

                {/*                        <div*/}
                {/*                            className={"flex items-center mb-3"}>*/}

                {/*                            <div*/}
                {/*                                className="flex items-center justify-center text-white w-10 h-10 bg-gray-900 rounded-full shadow flex-shrink-0 ">*/}
                {/*                                {arrowIcon}*/}
                {/*                            </div>*/}
                {/*                            <h3 className="h3 m-0 ml-3 ">*/}
                {/*                                Custom data sources, storage and auth*/}
                {/*                            </h3>*/}
                {/*                        </div>*/}

                {/*                        <p className="text-xl md:text-2xl">*/}
                {/*                            FireCMS has a great separation of concerns that will allow you to*/}
                {/*                            customize every aspect of it.*/}
                {/*                        </p>*/}

                {/*                        <p className="text-xl md:text-2xl">*/}
                {/*                            Use the provided Firestore, Firebase Realtime Database, or MongoDB controllers, or create*/}
                {/*                            your own custom data sources.*/}
                {/*                        </p>*/}

                {/*                        <p className="text-xl ">*/}
                {/*                            You can also use the schema definition*/}
                {/*                            API to create custom views and*/}
                {/*                            components.*/}
                {/*                        </p>*/}

                {/*                    </div>*/}
                {/*                    }/>*/}
            </Panel>

            <Panel color={"gray"} includePadding={true}>
                <div
                    className={"max-w-6xl md:w-full mx-auto md:col-span-9 md:pr-8 flex justify-center flex-col h-full mb-16"}>

                    <SyntaxHighlighter
                        className={clsx("p-4 max-w-xs overflow-x-auto sm:max-w-full overflow-y-hidden border border-solid", defaultBorderMixin)}
                        language={"typescript"}
                        showLineNumbers={false}
                        style={dracula}
                    >
                        {proExampleCode}
                    </SyntaxHighlighter>

                    <div className={"flex items-center mb-4 mt-16"}>

                        <div
                            className="flex items-center justify-center text-white w-10 h-10 bg-gray-900 rounded-full shadow flex-shrink-0 mr-3">
                            <LightingIcon height={12} width={12}/>
                        </div>

                        <h3 className="h3 m-0">
                            Inline editing
                        </h3>

                    </div>
                    <p className="text-xl md:text-2xl ">
                        FireCMS provides all the flexibility you
                        need with the best UX.
                        Edit your collections and entities using
                        both a <b>spreadsheet
                        view</b> and <b>powerful forms</b>.
                    </p>

                    <p className="text-xl ">
                        Inline editing is very useful when you want to
                        quickly edit a few fields of a
                        document. For example, if you have a list of users,
                        you can quickly edit the
                        name of the user by clicking on the name and editing
                        it.
                    </p>

                    <a
                        className={CTAOutlinedButtonMixin + " w-fit"}
                        href="https://demo.firecms.co"
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        Try the demo
                        <CTACaret/>
                    </a>
                </div>


            </Panel>
        </>
    );
}

const proExampleCode = `function ProSample() {

    // Use your own authentication logic here
    const myAuthenticator: Authenticator<FirebaseUser> = useCallback(async ({
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

