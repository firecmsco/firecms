import React from "react";
import { Box, Button } from "@material-ui/core";

import { useSnackbarController, useAuthContext } from "@camberi/firecms";

export function ExampleAdditionalView() {

    const snackbarController = useSnackbarController();
    const authContext = useAuthContext();

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

                {authContext.loggedUser ?
                    <div>Logged in as {authContext.loggedUser.displayName}</div>
                    :
                    <div>You are not logged in</div>}

                <Button
                    onClick={() => snackbarController.open({
                        type: "success",
                        message: "Test snackbar"
                    })}
                    color="primary">
                    Click me
                </Button>

            </Box>
        </Box>
    );
}
