import { Box, Typography } from "@mui/material";
import React, { ErrorInfo } from "react";

import ErrorIcon from "@mui/icons-material/Error";


export class ErrorBoundary extends React.Component<{}, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    // eslint-disable-next-line node/handle-callback-err
    static getDerivedStateFromError(error: Error) {
        return { hasError: true };
    }

    // eslint-disable-next-line node/handle-callback-err
    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // logErrorToMyService(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    display={"flex"}
                    flexDirection={"column"}
                    m={0.5}>
                    <Box
                        display={"flex"}
                        alignItems={"center"}
                        m={0.5}>
                        <ErrorIcon color={"error"} fontSize={"small"}/>
                        <Box marginLeft={1}>Error</Box>
                    </Box>
                    <Typography variant={"caption"}>
                        See the error in the console
                    </Typography>
                </Box>
            );
        }

        return this.props.children;
    }
}
