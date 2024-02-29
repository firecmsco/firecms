import React from "react";

// @ts-ignore
import pricePreview from "@site/static/img/price.png";

// @ts-ignore
import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { arrowIcon } from "../icons";

import TickIcon from "@site/static/img/icons/check.svg";
import { TwoColumns } from "../general/TwoColumns";
import { Panel } from "../general/Panel";
import clsx from "clsx";
import { ContainerInnerPaddingMixin, defaultBorderMixin } from "../styles";

export function ProDeveloperFeatures() {

    return (<>
            <Panel color={"gray"} includeMargin={false} includePadding={false}>

                <p className={clsx("text-center text-secondary uppercase font-mono font-bold border-0 border-b", ContainerInnerPaddingMixin, defaultBorderMixin)}>
                    For developers
                </p>

                <TwoColumns
                    reverseSmall={true}
                    animation={false}
                    className={"p-8"}
                    left={<div
                        className="relative flex-col font-mono">

                        <SyntaxHighlighter
                            className={clsx("p-4 max-w-xs overflow-x-auto sm:max-w-full overflow-y-hidden border border-solid", defaultBorderMixin)}
                            language={"typescript"}
                            showLineNumbers={false}
                            wrapLines={true}
                            style={dracula}
                        >
                            {`const firestoreDelegate = useFirestoreDelegate({
    firebaseApp,
    localTextSearchEnabled: false,
    textSearchControllerBuilder: myAlgoliaSearchControllerBuilder
});

const firestoreDelegate = useFirebaseRTDBDelegate({
    firebaseApp
});

const firestoreDelegate = useMongoDataSource({
    mongoDBApp,
    cluster: "my-cluster",
    database: "my-database",
});`}
                        </SyntaxHighlighter>
                    </div>
                    }
                    right={<div className="p-8">

                        <div
                            className={"flex items-center mb-3"}>

                            <div
                                className="flex items-center justify-center text-white w-10 h-10 bg-gray-900 rounded-full shadow flex-shrink-0 ">
                                {arrowIcon}
                            </div>
                            <h3 className="h3 m-0 ml-3 ">
                                Custom data sources, storage and auth
                            </h3>
                        </div>

                        <p className="text-xl md:text-2xl">
                            FireCMS has a great separation of concerns that will allow you to
                            customize every aspect of it.
                        </p>

                        <p className="text-xl md:text-2xl">
                            Use the provided Firestore, Firebase Realtime Database, or MongoDB controllers, or create
                            your own custom data sources.
                        </p>

                        <p className="text-xl ">
                            You can also use the schema definition
                            API to create custom views and
                            components.
                        </p>

                    </div>
                    }/>
            </Panel>

            <Panel color={"gray"} includeMargin={false} includePadding={false}>
                <TwoColumns
                    animation={false}
                    className={"p-8"}
                    left={
                        <div>
                            <div className={"flex items-center mb-3"}>

                                <div
                                    className="flex items-center justify-center text-white w-10 h-10 bg-gray-900 rounded-full shadow flex-shrink-0 mr-3">
                                    <TickIcon/>
                                </div>

                                <h3 className="h3 m-0">
                                    Built for every project
                                </h3>

                            </div>
                            <p className="text-xl md:text-2xl ">
                                FireCMS is a headless CMS built to work
                                with every existing Firebase/Firestore
                                project. It does not
                                enforce any data structure.
                            </p>
                            <p className="text-xl md:text-2xl ">
                                Use the integrated hooks and callbacks to
                                integrate your business logic in multiple
                                ways.
                            </p>

                        </div>
                    } right={
                    <>
                        <div
                            className="relative flex-col font-mono">
                            <SyntaxHighlighter
                                className={clsx("p-4 max-w-xs overflow-x-auto sm:max-w-full overflow-y-hidden border border-solid", defaultBorderMixin)}
                                language={"typescript"}
                                showLineNumbers={false}
                                style={dracula}
                            >
                                {`const productCollection = buildCollection({
    name: "Product",
    properties: {
        name: {
            dataType: "string",
            name: "Name",
            defaultValue: "Default name"
        },
        uppercase: {
            dataType: "string",
            name: "Uppercase Name",
            readOnly: true
        }
    }
});
    
const productCallbacks = buildEntityCallbacks({
    onPreSave: ({ values }) => {
        values.uppercase = values.name.toUpperCase();
        return values;
    }
});`}
                            </SyntaxHighlighter>
                        </div>
                    </>
                }/>


            </Panel>
        </>
    );
}
