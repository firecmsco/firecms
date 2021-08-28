import React, { useEffect } from "react";

import {
    Authenticator,
    buildCollection,
    buildSchema,
    FirestoreDatasource,
    CMSAppProvider,
    CMSMainView,
    NavigationBuilder,
    NavigationBuilderProps
} from "@camberi/firecms";
import { Box, CircularProgress } from "@material-ui/core";

import firebase from "firebase/app";

import "typeface-rubik";
import "typeface-space-mono";

import { firebaseConfig } from "./firebase_config";

const productSchema = buildSchema({
    name: "Product",
    properties: {
        name: {
            title: "Name",
            validation: { required: true },
            dataType: "string"
        },
        price: {
            title: "Price",
            validation: {
                required: true,
                requiredMessage: "You must set a price between 0 and 1000",
                min: 0,
                max: 1000
            },
            description: "Price with range validation",
            dataType: "number"
        },
        status: {
            title: "Status",
            validation: { required: true },
            dataType: "string",
            description: "Should this product be visible in the website",
            longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros.",
            config: {
                enumValues: {
                    private: "Private",
                    public: "Public"
                }
            }
        }
    }
});

export function SimpleAppWithProvider() {

    const [
        firebaseConfigInitialized,
        setFirebaseConfigInitialized
    ] = React.useState<boolean>(false);

    useEffect(() => {
        if (firebase.apps.length === 0) {
            try {
                firebase.initializeApp(firebaseConfig);
                firebase.analytics();
                setFirebaseConfigInitialized(true);
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const navigation: NavigationBuilder = ({ user }: NavigationBuilderProps) => ({
        collections: [
            buildCollection({
                relativePath: "products",
                schema: productSchema,
                name: "Products",
                permissions: ({ user }) => ({
                    edit: true,
                    create: true,
                    delete: true
                })
            })
        ]
    });

    const myAuthenticator: Authenticator = (user?: firebase.User) => {
        console.log("Allowing access to", user?.email);
        return true;
    };

    if (!firebaseConfigInitialized) {
        return <Box
            display="flex"
            width={"100%"} height={"100vh"}>
            <Box m="auto">
                <CircularProgress/>
            </Box>
        </Box>;
    }

    return (
        <CMSAppProvider
            authentication={myAuthenticator}
            navigation={navigation}
            dataSource={FirestoreDatasource}
            firebaseConfig={firebaseConfig}>
            {() => <CMSMainView name={"My Online Shop"}/>}
        </CMSAppProvider>
    );
}
