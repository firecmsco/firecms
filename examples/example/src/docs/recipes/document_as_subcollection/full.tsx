import React from "react";
import {
    buildCollection,
    EntityCollectionsBuilder,
} from "@firecms/core";

import "typeface-rubik";
import "@fontsource/ibm-plex-mono";
import { FirebaseCMSApp } from "@firecms/firebase_firecms";

// TODO: Replace with your config
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

type Unit = {
    name: string;
    description: string;
}

const unitsCollection = buildCollection<Unit>({
    name: "Units",
    singularName: "Unit",
    group: "Main",
    path: "units",
    customId: true,
    icon: "LocalLibrary",
    callbacks: {
        onSaveSuccess: ({ context }) => {
            context.navigation.refreshNavigation();
        },
        onDelete: ({ context }) => {
            context.navigation.refreshNavigation();
        }
    },
    properties: {
        name: {
            name: "Name",
            validation: { required: true },
            dataType: "string"
        },
        description: {
            name: "Description",
            validation: { required: true },
            dataType: "string",
            multiline: true
        }
    }
});

export default function App() {

    const collectionBuilder: EntityCollectionsBuilder = async ({ dataSource }) => {
        const units = await dataSource.fetchCollection<Unit>({
            path: "units",
            collection: unitsCollection
        });
        const lessonCollections = units.map(unit => buildCollection({
            name: unit.values.name,
            path: `units/${unit.id}/lessons`,
            description: unit.values.description,
            group: "Units",
            properties: {
                name: {
                    name: "Name",
                    dataType: "string"
                }
            }
        }));

        return [
            unitsCollection,
            ...lessonCollections
        ]
    };

    return <FirebaseCMSApp
        name={"My learning app"}
        collections={collectionBuilder}
        firebaseConfig={firebaseConfig}
    />;
}
