import React from "react";
import { Box, Button } from "@material-ui/core";
import { Entity, useSnackbarController } from "@camberi/firecms";

export function SampleProductsView({ entity }: {
    entity?: Entity<any>
}) {

    const snackbarContext = useSnackbarController();

    const onClick = (event: React.MouseEvent) => {
        snackbarContext.open({
            type: "success",
            message: `Clicked on ${entity?.values.name}`
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

                <div>
                    This is an example of a custom view added
                    as a panel to an entity schema
                </div>

                <Button onClick={onClick} color="primary">
                    Your action
                </Button>

            </Box>
        </Box>
    );

}
