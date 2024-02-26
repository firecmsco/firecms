import { useCallback } from "react";
import { BrowserRouter } from "react-router-dom";

import { useDataEnhancementPlugin } from "@firecms/data_enhancement";
import { useImportExportPlugin } from "@firecms/data_import_export";

import { User as FirebaseUser } from "firebase/auth";
import { Authenticator, buildCollection, FireCMSProApp } from "@firecms/firebase_pro";

import "typeface-rubik";
import "@fontsource/ibm-plex-mono";

const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

const productsCollection = buildCollection({
    path: "products",
    id: "ppp",
    name: "Products",
    singularName: "Product",
    group: "E-commerce",
    icon: "shopping_cart",
    description: "List of the products currently sold in our shop",
    textSearchEnabled: true,
    properties: {
        name: {
            dataType: "string",
            name: "Name",
            description: "Name of this product",
            clearable: true,
            validation: {
                required: true
            }
        },
        main_image: {
            dataType: "string",
            name: "Image",
            storage: {
                storagePath: "images",
                acceptedFiles: ["image/*"],
                maxSize: 1024 * 1024,
                metadata: {
                    cacheControl: "max-age=1000000"
                },
                imageCompression: {
                    maxHeight: 200
                }
            },
            description: "Upload field for images",
            validation: {
                required: true
            }
        },
        category: {
            dataType: "string",
            name: "Category",
            clearable: true,
            enumValues: {
                cameras: "Cameras",
                clothing_man: "Clothing man",
                clothing_woman: "Clothing woman",
                coffee_and_tea: "Coffee and tea",
                cookbooks: "Cookbooks",
                delicatessen: "Delicatessen",
            }
        },
        available: {
            dataType: "boolean",
            name: "Available",
            columnWidth: 100,
            description: "Is this product available in the website"
        },
        price: ({ values }) => ({
            dataType: "number",
            name: "Price",
            validation: {
                requiredMessage: "You must set a price between 0 and 1000",
                min: 0,
                max: 1000
            },
            disabled: !values.available && {
                clearOnDisabled: true,
                disabledMessage: "You can only set the price on available items"
            },
            description: "Price with range validation"
        }),
    }

});

export default function SimpleProApp() {

    const myAuthenticator: Authenticator<FirebaseUser> = useCallback(async ({
                                                                                user,
                                                                                authController
                                                                            }) => {

        if (user?.email?.includes("flanders")) {
            throw Error("Stupid Flanders!");
        }

        console.log("Allowing access to", user?.email);

        return true;
    }, []);

    const importExportPlugin = useImportExportPlugin();

    const dataEnhancementPlugin = useDataEnhancementPlugin({
        // Paths that will be enhanced
        getConfigForPath: ({ path }) => {
            return true;
        }
    });

    return <BrowserRouter>
        <FireCMSProApp
            name={"My Online Shop"}
            plugins={[importExportPlugin, dataEnhancementPlugin]}
            authentication={myAuthenticator}
            collections={[productsCollection]}
            firebaseConfig={firebaseConfig}
        />
    </BrowserRouter>;
}
