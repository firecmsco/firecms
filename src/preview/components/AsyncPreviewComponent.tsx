import { Skeleton } from "@mui/material";
import * as React from "react";
import { useEffect, useState } from "react";
import { EntitySchema } from "../../models";

export interface AsyncPreviewComponentProps<M extends { [Key: string]: any }> {

    builder: Promise<React.ReactNode>;

}

function AsyncPreviewComponentInternal<M extends { [Key: string]: any }>(
    {
        builder
    }: AsyncPreviewComponentProps<M>): JSX.Element {

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

const MemoAsyncPreviewComponent = React.memo(AsyncPreviewComponentInternal) as React.FunctionComponent<AsyncPreviewComponentProps<EntitySchema>>;

/**
 * Utility component used to render the result of an async execution.
 * It shows a loading indicator while at it.
 *
 * @category Preview components
 */
export function AsyncPreviewComponent(props: AsyncPreviewComponentProps<EntitySchema>) {
    return <MemoAsyncPreviewComponent {...props} />;
}
