import React from "react";
import { Box, Button } from "@material-ui/core";

import {
    buildSchema,
    useAuthContext,
    useSideEntityController,
    useSnackbarController
} from "@camberi/firecms";

/**
 * Sample CMS view not bound to a collection, customizable by the developer
 * @constructor
 */
export function ExampleCMSView() {

    const snackbarController = useSnackbarController();
    const sideEntityController = useSideEntityController();
    const authController = useAuthContext();

    const customProductSchema = buildSchema({
        name: "Custom product",
        properties: {
            name: {
                title: "Name",
                validation: { required: true },
                dataType: "string"
            },
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

                {authController.loggedUser ?
                    <div>Logged in as {authController.loggedUser.displayName}</div>
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
                        collectionPath: "/products-test",
                        schema: customProductSchema
                    })}
                    color="primary">
                    Open entity with custom schema
                </Button>

            </Box>
        </Box>
    );
}
