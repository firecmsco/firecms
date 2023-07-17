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
            className="flex w-full h-screen max-h-full max-w-full">
            <div className="m-auto">
                <CircularProgress {...props}/>
            </div>
        </div>
    );
}
