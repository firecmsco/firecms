import React from "react";
import { Box, Paper } from "@material-ui/core";

interface BreadcrumbProps {
    children: React.ReactNode;
}

export const BreadcrumbContainer: React.FunctionComponent<BreadcrumbProps> = ({ children }) => {
    return (
        <Box display="flex">
            <Paper elevation={0}>
                <Box p={1} pr={2} pl={2}>
                    {children}
                </Box>
            </Paper>
        </Box>
    );
};
