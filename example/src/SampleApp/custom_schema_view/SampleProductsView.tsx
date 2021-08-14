import React from "react";
import { Box, Button } from "@material-ui/core";
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

    const includePropertyValue = (key:string, value: any ): boolean => {
        if (key === "related_products")
            return false;
        return true;
    };

    const values = modifiedValues ?
        Object.entries(modifiedValues)
            .filter(([key, value]) => includePropertyValue(key, value))
            .map(([key, value]) => ({ [key]: value }))
            .reduce((a, b) => ({ ...a, ...b }))
        : {};

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

                    <small>
                        Note that "Related products" is intentionally excluded from this JSON preview
                    </small>

                </Box>

                <Button onClick={onClick} color="primary">
                    Your action
                </Button>

            </Box>
        </Box>
    );

}
