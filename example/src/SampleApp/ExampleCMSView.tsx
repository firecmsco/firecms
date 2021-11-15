import React from "react";
import { Box, Button } from "@mui/material";

import {
    buildSchema,
    EntityCollection,
    EntityCollectionView,
    useAuthController,
    useSelectionController,
    useSideEntityController,
    useSnackbarController
} from "@camberi/firecms";

/**
 * Sample CMS view not bound to a collection, customizable by the developer
 * @constructor
 */
export function ExampleCMSView({
                                   path,
                                   collection
                               }: { path: string, collection: EntityCollection }) {

    // hook to display custom snackbars
    const snackbarController = useSnackbarController();

    const selectionController = useSelectionController();

    console.log("Selection from ExampleCMSView", selectionController.selectedEntities);

    // hook to open the side dialog that shows the entity forms
    const sideEntityController = useSideEntityController();

    // hook to do operations related to authentication
    const authController = useAuthController();

    const customProductSchema = buildSchema({
        name: "Custom product",
        properties: {
            name: {
                title: "Name",
                validation: { required: true },
                dataType: "string"
            },
            very_custom_field: {
                title: "Very custom field",
                dataType: "string"
            }
        }
    });

    return (
        <Box
            display="flex"
            width={"100%"}
            height={"100%"}>

            <Box m="auto"
                 display="flex"
                 flexDirection={"column"}
                 alignItems={"center"}
                 justifyItems={"center"}>

                <div>This is an example of an additional view</div>

                {authController.user ?
                    <div>Logged in
                        as {authController.user.displayName}</div>
                    :
                    <div>You are not logged in</div>}

                <Button
                    onClick={() => snackbarController.open({
                        type: "success",
                        message: "This is pretty cool"
                    })}
                    color="primary">
                    Test snackbar
                </Button>

                <Button
                    onClick={() => sideEntityController.open({
                        entityId: "B003WT1622",
                        path: "/products-test",
                        schema: customProductSchema,
                        width: 800
                    })}
                    color="primary">
                    Open entity with custom schema
                </Button>

                <div style={{
                    width: 800,
                    height: 400,
                    padding: 32
                }}>
                    <EntityCollectionView path={path}
                                          collection={{
                                              ...collection,
                                              selectionController
                                          }}/>
                </div>


            </Box>
        </Box>
    );
}
