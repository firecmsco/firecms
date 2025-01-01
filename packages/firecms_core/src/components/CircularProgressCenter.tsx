import React from "react";
import { CircularProgress, CircularProgressProps, Typography } from "@firecms/ui";

/**
 *
 * @param text
 * @param props

 * @ignore
 */
export function CircularProgressCenter({ text, ...props }: CircularProgressProps & {
    text?: string
}) {
    return (
        <div
            className="flex w-full h-screen max-h-full max-w-full gap-4">
            <div className="m-auto flex flex-col gap-2 items-center">
                <CircularProgress {...props}/>
                {text && <Typography
                    color={"secondary"}
                    variant={"caption"}
                    className="text-center">{text}</Typography>}
            </div>
        </div>
    );
}
