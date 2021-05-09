import { Box, Typography } from "@material-ui/core";
import React, { ErrorInfo, FunctionComponent } from "react";

import ErrorIcon from "@material-ui/icons/Error";
import { useTranslation } from "react-i18next";

const ErrorFallback : FunctionComponent = () => {
    const { t } = useTranslation();
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
                <Box marginLeft={1}>{t("error")}</Box>
            </Box>
            <Typography variant={"caption"}>
                {t("errorSeeInConsole")}
            </Typography>
        </Box>
    );
}

export default class ErrorBoundary extends React.Component<{}, {hasError:boolean}> {
    constructor(props:any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error:Error) {
        return { hasError: true };
    }

    componentDidCatch(error:Error, errorInfo:ErrorInfo) {
        // logErrorToMyService(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <ErrorFallback />;
        }

        return this.props.children;
    }
}
