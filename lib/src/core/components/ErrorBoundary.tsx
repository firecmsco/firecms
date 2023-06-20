import React, { ErrorInfo, PropsWithChildren } from "react";

import ErrorIcon from "@mui/icons-material/Error";
import Typography from "../../components/Typography";

export class ErrorBoundary extends React.Component<PropsWithChildren<Record<string, unknown>>, {
    error: Error | null
}> {
    constructor(props: any) {
        super(props);
        this.state = { error: null };
    }

    // eslint-disable-next-line n/handle-callback-err
    static getDerivedStateFromError(error: Error) {
        return { error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(error);
        // logErrorToMyService(error, errorInfo);
    }

    render() {
        if (this.state.error) {
            return (
                <div className="flex flex-col m-2">
                    <div className="flex items-center m-2">
                        <ErrorIcon color={"error"} fontSize={"small"}/>
                        <div className="ml-4">Error</div>
                    </div>
                    <Typography variant={"caption"}>
                        {this.state.error?.message ?? "See the error in the console"}
                    </Typography>
                </div>
            );
        }

        return this.props.children;
    }
}
