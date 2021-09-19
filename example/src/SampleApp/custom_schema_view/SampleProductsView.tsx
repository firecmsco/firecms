import React from "react";
import { Box, Button } from "@mui/material";
import { Entity, EntityValues, useSnackbarController } from "@camberi/firecms";
import { Product } from "../types";

export function SampleProductsView({ entity, modifiedValues }: {
    entity?: Entity<Product>;
    modifiedValues?: EntityValues<Product>;
}) {

    const snackbarContext = useSnackbarController();

    const onClick = (event: React.MouseEvent) => {
        snackbarContext.open({
            type: "success",
            message: `Custom action for ${modifiedValues?.name}`
        });
    };

    const values = modifiedValues ? modifiedValues : {};

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

                <Box p={4}>
                    <p>
                        This is an example of a custom view added
                        as a panel to an entity schema.
                    </p>
                    <p>
                        Values in the form:
                    </p>

                    {values && <p style={{
                        color: "#fff",
                        padding: "8px",
                        fontSize: ".85em",
                        fontFamily: "monospace",
                        borderRadius: "4px",
                        backgroundColor: "#4e482f"
                    }}>
                        {JSON.stringify(values, null, 2)}
                    </p>}


                </Box>

                <Button onClick={onClick} color="primary">
                    Your action
                </Button>

            </Box>
        </Box>
    );

}
