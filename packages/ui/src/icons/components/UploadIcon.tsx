import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const UploadIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"upload"} ref={ref}/>
});

UploadIcon.displayName = "UploadIcon";
