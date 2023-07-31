import React from "react";
import { CircularProgress, CircularProgressProps } from "../../components";

/**
 *
 * @param props
 * @constructor
 * @ignore
 */
export function CircularProgressCenter(props: CircularProgressProps) {
    return (
        <div
            className="flex w-full h-screen max-h-full max-w-full bg-gray-50 dark:bg-gray-900">
            <div className="m-auto">
                <CircularProgress {...props}/>
            </div>
        </div>
    );
}
