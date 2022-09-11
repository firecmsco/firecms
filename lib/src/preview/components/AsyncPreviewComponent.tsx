import { Skeleton } from "@mui/material";
import * as React from "react";
import { useEffect, useState } from "react";
import { CMSType } from "../../models";

export interface AsyncPreviewComponentProps {
    builder: Promise<React.ReactNode>;
}

/**
 * Utility component used to render the result of an async execution.
 * It shows a loading indicator while at it.
 *
 * @category Preview components
 */
export const AsyncPreviewComponent = React.memo(AsyncPreviewComponentInternal) as React.FunctionComponent<AsyncPreviewComponentProps>;

function AsyncPreviewComponentInternal<M extends object>(
    {
        builder
    }: AsyncPreviewComponentProps): JSX.Element {

    const [loading, setLoading] = useState<boolean>(true);
    const [result, setResult] = useState<React.ReactNode>(null);

    useEffect(() => {
        let unmounted = false;
        builder
            .then((res) => {
                if (!unmounted) {
                    setLoading(false);
                    setResult(res);
                }
            })
            .catch(error => {
                setLoading(false);
                console.error(error);
            });
        return () => {
            unmounted = true;
        };
    }, [builder]);

    if (loading)
        return <Skeleton variant="text"/>;

    return <React.Fragment>{result}</React.Fragment>;

}
