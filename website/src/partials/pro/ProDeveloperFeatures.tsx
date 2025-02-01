import React from "react";

// @ts-ignore
import pricePreview from "@site/static/img/price.png";

// @ts-ignore
// import SyntaxHighlighter from "react-syntax-highlighter";
// @ts-ignore
// import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Panel } from "../general/Panel";
import clsx from "clsx";
import {
    ContainerInnerPaddingMixin,
    CTAButtonMixin,
    CTACaret,
    CTAOutlinedButtonWhiteMixin,
    defaultBorderMixin
} from "../styles";

// developer features:
// - use all the internal hooks
// - use all the internal components
// - use all the internal controllers
// - use all the internal plugins
// - use custom data sources, storage and auth
export function ProDeveloperFeatures() {

    return (<>

            <Panel color={"gray"} includeMargin={false} includePadding={false}
                   header={<p
                       className={clsx("text-center text-secondary uppercase font-mono font-bold border-0 border-b", ContainerInnerPaddingMixin, defaultBorderMixin)}>
                       For developers
                   </p>}>


                <div
                    className={"max-w-6xl w-full mx-auto md:col-span-9 md:pr-8 flex justify-center flex-col h-full mb-16"}>


                    <div className={"flex items-center mb-4 mt-16"}>

                        {/*<div*/}
                        {/*    className="flex items-center justify-center text-white w-10 h-10 bg-gray-900 rounded-full shadow flex-shrink-0 mr-3">*/}
                        {/*    <LightingIcon height={12} width={12}/>*/}
                        {/*</div>*/}

                        <h3 className="m-0 uppercase font-mono">
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
                            className={CTAOutlinedButtonWhiteMixin + " w-fit"}
                            href="https://demo.firecms.co"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            Try the demo
                            <CTACaret/>
                        </a>

                        <a
                            className={CTAButtonMixin + "  "}
                            href={"https://calendar.app.google/tsbW6gSKVZDefgMf9"}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            Book a meeting
                        </a>
                    </div>

                    <pre className={"bg-gray-900 mt-8 p-4 rounded"} dangerouslySetInnerHTML={{ __html: proExampleCode }}></pre>

                    {/*<SyntaxHighlighter*/}
                    {/*    className={clsx("mt-16 p-4 overflow-x-auto md:max-w-full overflow-y-hidden border border-solid", defaultBorderMixin)}*/}
                    {/*    language={"typescript"}*/}
                    {/*    showLineNumbers={false}*/}
                    {/*    style={dracula}*/}
                    {/*>*/}
                    {/*    {proExampleCode}*/}
                    {/*</SyntaxHighlighter>*/}

                </div>


            </Panel>
        </>
    );
}

const proExampleCode = `<span class="token keyword">function</span> <span class="token function">ProSample</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>

    <span class="token comment">// Use your own authentication logic here</span>
    <span class="token keyword">const</span> <span class="token literal-property property">myAuthenticator</span><span class="token operator">:</span> Authenticator<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">FirebaseUserWrapper</span></span><span class="token punctuation">></span></span><span class="token plain-text"> = useCallback(async ({
                                                                                       user,
                                                                                       authController
                                                                                   }) => </span><span class="token punctuation">{</span>

        <span class="token keyword">if</span> <span class="token punctuation">(</span>user<span class="token operator">?.</span>email<span class="token operator">?.</span><span class="token function">includes</span><span class="token punctuation">(</span><span class="token string">"flanders"</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">throw</span> <span class="token function">Error</span><span class="token punctuation">(</span><span class="token string">"Stupid Flanders!"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token comment">// This is an example of retrieving async data related to the user</span>
        <span class="token comment">// and storing it in the controller's extra field</span>
        <span class="token keyword">const</span> idTokenResult <span class="token operator">=</span> <span class="token keyword">await</span> user<span class="token operator">?.</span>firebaseUser<span class="token operator">?.</span><span class="token function">getIdTokenResult</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">const</span> userIsAdmin <span class="token operator">=</span> idTokenResult<span class="token operator">?.</span>claims<span class="token punctuation">.</span>admin <span class="token operator">||</span> user<span class="token operator">?.</span>email<span class="token operator">?.</span><span class="token function">endsWith</span><span class="token punctuation">(</span><span class="token string">"@firecms.co"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">"Allowing access to"</span><span class="token punctuation">,</span> user<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token function">Boolean</span><span class="token punctuation">(</span>userIsAdmin<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token plain-text">, []);
    
    <span class="token keyword">const</span> <span class="token punctuation">{</span>
        firebaseApp<span class="token punctuation">,</span>
        firebaseConfigLoading<span class="token punctuation">,</span>
        configError
    <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">useInitialiseFirebase</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
        firebaseConfig
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>


    <span class="token comment">// Controller used to manage the dark or light color mode</span>
    <span class="token keyword">const</span> modeController <span class="token operator">=</span> <span class="token function">useBuildModeController</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">const</span> <span class="token literal-property property">signInOptions</span><span class="token operator">:</span> FirebaseSignInProvider<span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token string">"google.com"</span><span class="token punctuation">]</span><span class="token punctuation">;</span>

    <span class="token comment">// Controller for saving some user preferences locally.</span>
    <span class="token keyword">const</span> userConfigPersistence <span class="token operator">=</span> <span class="token function">useBuildLocalConfigurationPersistence</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// Delegate used for fetching and saving data in Firestore</span>
    <span class="token keyword">const</span> firestoreDelegate <span class="token operator">=</span> <span class="token function">useFirestoreDelegate</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
        firebaseApp
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// Controller used for saving and fetching files in storage</span>
    <span class="token keyword">const</span> storageSource <span class="token operator">=</span> <span class="token function">useFirebaseStorageSource</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
        firebaseApp
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">const</span> collectionConfigController <span class="token operator">=</span> <span class="token function">useFirestoreCollectionsConfigController</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
        firebaseApp
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// Controller for managing authentication</span>
    <span class="token keyword">const</span> <span class="token literal-property property">firebaseAuthController</span><span class="token operator">:</span> FirebaseAuthController <span class="token operator">=</span> <span class="token function">useFirebaseAuthController</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
        firebaseApp<span class="token punctuation">,</span>
        signInOptions
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// controller in charge of user management</span>
    <span class="token keyword">const</span> userManagement <span class="token operator">=</span> <span class="token function">useBuildUserManagement</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
        <span class="token literal-property property">dataSourceDelegate</span><span class="token operator">:</span> firestoreDelegate<span class="token punctuation">,</span>
        <span class="token literal-property property">authController</span><span class="token operator">:</span> firebaseAuthController
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">const</span> authController <span class="token operator">=</span> userManagement<span class="token punctuation">;</span>

    <span class="token keyword">const</span> <span class="token punctuation">{</span>
        authLoading<span class="token punctuation">,</span>
        canAccessMainView<span class="token punctuation">,</span>
        notAllowedError
    <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">useValidateAuthenticator</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
        <span class="token literal-property property">disabled</span><span class="token operator">:</span> userManagement<span class="token punctuation">.</span>loading<span class="token punctuation">,</span>
        <span class="token literal-property property">authenticator</span><span class="token operator">:</span> userManagement<span class="token punctuation">.</span>authenticator<span class="token punctuation">,</span>
        authController<span class="token punctuation">,</span>
        <span class="token comment">// authenticator: myAuthenticator,</span>
        <span class="token literal-property property">dataSourceDelegate</span><span class="token operator">:</span> firestoreDelegate<span class="token punctuation">,</span>
        storageSource
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">const</span> collectionsBuilder <span class="token operator">=</span> <span class="token function">useCallback</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span>
        <span class="token keyword">const</span> collections <span class="token operator">=</span> <span class="token punctuation">[</span>
            booksCollection<span class="token punctuation">,</span>
            <span class="token comment">// Your collections here</span>
        <span class="token punctuation">]</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token function">mergeCollections</span><span class="token punctuation">(</span>collections<span class="token punctuation">,</span> collectionConfigController<span class="token punctuation">.</span>collections <span class="token operator">??</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">[</span>collectionConfigController<span class="token punctuation">.</span>collections<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">const</span> navigationController <span class="token operator">=</span> <span class="token function">useBuildNavigationController</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
        <span class="token literal-property property">collections</span><span class="token operator">:</span> collectionsBuilder<span class="token punctuation">,</span>
        <span class="token literal-property property">collectionPermissions</span><span class="token operator">:</span> userManagement<span class="token punctuation">.</span>collectionPermissions<span class="token punctuation">,</span>
        <span class="token literal-property property">adminViews</span><span class="token operator">:</span> userManagementAdminViews<span class="token punctuation">,</span>
        authController<span class="token punctuation">,</span>
        <span class="token literal-property property">dataSourceDelegate</span><span class="token operator">:</span> firestoreDelegate
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">const</span> dataEnhancementPlugin <span class="token operator">=</span> <span class="token function">useDataEnhancementPlugin</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
        <span class="token function-variable function">getConfigForPath</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">{</span> path <span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>path <span class="token operator">===</span> <span class="token string">"books"</span><span class="token punctuation">)</span>
                <span class="token keyword">return</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
            <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">const</span> userManagementPlugin <span class="token operator">=</span> <span class="token function">useUserManagementPlugin</span><span class="token punctuation">(</span><span class="token punctuation">{</span> userManagement <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">const</span> importPlugin <span class="token operator">=</span> <span class="token function">useImportPlugin</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">const</span> exportPlugin <span class="token operator">=</span> <span class="token function">useExportPlugin</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">const</span> collectionEditorPlugin <span class="token operator">=</span> <span class="token function">useCollectionEditorPlugin</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
        collectionConfigController
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span>firebaseConfigLoading <span class="token operator">||</span> <span class="token operator">!</span>firebaseApp<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">CircularProgressCenter</span></span><span class="token punctuation">/></span></span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span>configError<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span></span><span class="token punctuation">></span></span><span class="token punctuation">{</span>configError<span class="token punctuation">}</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span></span><span class="token punctuation">></span></span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">SnackbarProvider</span></span><span class="token punctuation">></span></span><span class="token plain-text">
            </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">ModeControllerProvider</span></span> <span class="token attr-name">value</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>modeController<span class="token punctuation">}</span></span><span class="token punctuation">></span></span><span class="token plain-text">
                </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">FireCMS</span></span>
                    <span class="token attr-name">navigationController</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>navigationController<span class="token punctuation">}</span></span>
                    <span class="token attr-name">authController</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>authController<span class="token punctuation">}</span></span>
                    <span class="token attr-name">userConfigPersistence</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>userConfigPersistence<span class="token punctuation">}</span></span>
                    <span class="token attr-name">dataSourceDelegate</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>firestoreDelegate<span class="token punctuation">}</span></span>
                    <span class="token attr-name">storageSource</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>storageSource<span class="token punctuation">}</span></span>
                    <span class="token attr-name">plugins</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">[</span>dataEnhancementPlugin<span class="token punctuation">,</span> importPlugin<span class="token punctuation">,</span> exportPlugin<span class="token punctuation">,</span> userManagementPlugin<span class="token punctuation">,</span> collectionEditorPlugin<span class="token punctuation">]</span><span class="token punctuation">}</span></span>
                <span class="token punctuation">></span></span><span class="token plain-text">
                    </span><span class="token punctuation">{</span><span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">{</span>
                          context<span class="token punctuation">,</span>
                          loading
                      <span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span>

                        <span class="token keyword">if</span> <span class="token punctuation">(</span>loading <span class="token operator">||</span> authLoading<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                            <span class="token keyword">return</span> <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">CircularProgressCenter</span></span> <span class="token attr-name">size</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token string">"large"</span><span class="token punctuation">}</span></span><span class="token punctuation">/></span></span><span class="token punctuation">;</span>
                        <span class="token punctuation">}</span>
                        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>canAccessMainView<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                            <span class="token keyword">return</span> <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">FirebaseLoginView</span></span> <span class="token attr-name">authController</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>authController<span class="token punctuation">}</span></span>
                                                      <span class="token attr-name">firebaseApp</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>firebaseApp<span class="token punctuation">}</span></span>
                                                      <span class="token attr-name">signInOptions</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>signInOptions<span class="token punctuation">}</span></span>
                                                      <span class="token attr-name">notAllowedError</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>notAllowedError<span class="token punctuation">}</span></span><span class="token punctuation">/></span></span><span class="token punctuation">;</span>
                        <span class="token punctuation">}</span>

                        <span class="token keyword">return</span> <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Scaffold</span></span>
                            <span class="token attr-name">autoOpenDrawer</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token boolean">false</span><span class="token punctuation">}</span></span><span class="token punctuation">></span></span><span class="token plain-text">
                            </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">AppBar</span></span> <span class="token attr-name">title</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token string">"My demo app"</span><span class="token punctuation">}</span></span><span class="token punctuation">/></span></span><span class="token plain-text">
                            </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Drawer</span></span><span class="token punctuation">/></span></span><span class="token plain-text">
                            </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">NavigationRoutes</span></span><span class="token punctuation">/></span></span><span class="token plain-text">
                            </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">SideDialogs</span></span><span class="token punctuation">/></span></span><span class="token plain-text">
                        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">Scaffold</span></span><span class="token punctuation">></span></span><span class="token punctuation">;</span>
                    <span class="token punctuation">}</span><span class="token punctuation">}</span><span class="token plain-text">
                </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">FireCMS</span></span><span class="token punctuation">></span></span><span class="token plain-text">
            </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">ModeControllerProvider</span></span><span class="token punctuation">></span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">SnackbarProvider</span></span><span class="token punctuation">></span></span>
    <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token punctuation">}</span>
`;

// const proExampleCode = `function ProSample() {
//
//     // Use your own authentication logic here
//     const myAuthenticator: Authenticator<FirebaseUserWrapper> = useCallback(async ({
//                                                                                 user,
//                                                                                 authController
//                                                                             }) => {
//
//         if (user?.email?.includes("flanders")) {
//             throw Error("Stupid Flanders!");
//         }
//
//         // This is an example of retrieving async data related to the user
//         // and storing it in the controller's extra field
//         const idTokenResult = await user?.getIdTokenResult();
//         const userIsAdmin = idTokenResult?.claims.admin || user?.email?.endsWith("@firecms.co");
//
//         console.log("Allowing access to", user);
//         return Boolean(userIsAdmin);
//     }, []);
//
//     const collections = [
//         booksCollection,
//         // Your collections here
//     ];
//
//     const {
//         firebaseApp,
//         firebaseConfigLoading,
//         configError
//     } = useInitialiseFirebase({
//         firebaseConfig
//     });
//
//     // Controller used to manage the dark or light color mode
//     const modeController = useBuildModeController();
//
//     const signInOptions: FirebaseSignInProvider[] = ["google.com"];
//
//     // Controller for managing authentication
//     const authController: FirebaseAuthController = useFirebaseAuthController({
//         firebaseApp,
//         signInOptions
//     });
//
//     // Controller for saving some user preferences locally.
//     const userConfigPersistence = useBuildLocalConfigurationPersistence();
//
//     // Delegate used for fetching and saving data in Firestore
//     const firestoreDelegate = useFirestoreDelegate({
//         firebaseApp
//     });
//
//     // Controller used for saving and fetching files in storage
//     const storageSource = useFirebaseStorageSource({
//         firebaseApp
//     });
//
//     const navigationController = useBuildNavigationController({
//         collections,
//         authController,
//         dataSourceDelegate: firestoreDelegate
//     });
//
//     const dataEnhancementPlugin = useDataEnhancementPlugin({
//         getConfigForPath: ({ path }) => {
//             if (path === "books")
//                 return true;
//             return false;
//         }
//     });
//
//     const importExportPlugin = useImportExportPlugin();
//
//     if (firebaseConfigLoading || !firebaseApp) {
//         return <CircularProgressCenter/>;
//     }
//
//     if (configError) {
//         return <CenteredView>{configError}</CenteredView>;
//     }
//     return (
//         <SnackbarProvider>
//             <ModeControllerProvider value={modeController}>
//                 <FireCMS
//                     navigationController={navigationController}
//                     authController={authController}
//                     userConfigPersistence={userConfigPersistence}
//                     dataSourceDelegate={firestoreDelegate}
//                     storageSource={storageSource}
//                     plugins={[dataEnhancementPlugin, importExportPlugin]}
//                 >
//                     {({
//                           context,
//                           loading
//                       }) => {
//
//                         if (loading) {
//                             return <CircularProgressCenter size={"large"}/>;
//                         }
//                         if (authController.user === null) {
//                             return <FirebaseLoginView authController={authController}
//                                                       firebaseApp={firebaseApp}
//                                                       signInOptions={signInOptions}/>
//                         }
//
//                         return <Scaffold autoOpenDrawer={false}>
//                             <AppBar title={"My amazing CMS"}/>
//                             <Drawer/>
//                             <NavigationRoutes/>
//                             <SideDialogs/>
//                         </Scaffold>;
//                     }}
//                 </FireCMS>
//             </ModeControllerProvider>
//         </SnackbarProvider>
//     );
//
// }`;

