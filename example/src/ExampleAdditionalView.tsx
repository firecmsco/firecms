import React from "react";
import { Box } from "@material-ui/core";

export function ExampleAdditionalView(props: {}) {
    return (
        <Box
            display="flex"
            width={"100%"}
            height={"100%"}>
            <Box m="auto">
                This is an example of an additional view
            </Box>
        </Box>
    );
}
