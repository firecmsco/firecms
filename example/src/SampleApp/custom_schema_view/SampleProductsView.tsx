import React from "react";
import { Box, Button } from "@material-ui/core";
import { Entity, EntityValues, useSnackbarController } from "@camberi/firecms";

export function SampleProductsView({ entity, modifiedValues }: {
    entity?: Entity<any>;
    modifiedValues?: EntityValues<any>;
}) {

    const snackbarContext = useSnackbarController();

    const onClick = (event: React.MouseEvent) => {
        snackbarContext.open({
            type: "success",
            message: `Custom action for ${modifiedValues?.name}`
        });
    };

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

                <Box p={2}>
                    <p>
                        This is an example of a custom view added
                        as a panel to an entity schema.
                    </p>
                    <p>
                        Values in the form:
                    </p>
                    <p style={{
                        color: "#fff",
                        padding: "8px",
                        fontSize: ".85em",
                        fontFamily: "monospace",
                        borderRadius: "4px",
                        backgroundColor: "#4e482f"
                    }}>
                        {modifiedValues && JSON.stringify(modifiedValues, null, 2)}
                    </p>
                </Box>

                <Button onClick={onClick} color="primary">
                    Your action
                </Button>

            </Box>
        </Box>
    );

}
