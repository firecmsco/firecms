import React, { ReactElement } from "react";

import { PropertyPreviewProps } from "@firecms/core";

export default function MsDurationPreview({
                                                 value, property, size
                                             }: PropertyPreviewProps<number>)
     {
        if (!value)
        return null;

        const min = Math.floor(((value as unknown as number)/1000/60) << 0)
        const sec = Math.floor(((value as unknown as number)/1000) % 60)
    return (
        <div>
            {min} : {sec}
        </div>
    );
}
