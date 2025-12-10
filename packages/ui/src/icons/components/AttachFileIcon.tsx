import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AttachFileIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"attach_file"} ref={ref}/>
});

AttachFileIcon.displayName = "AttachFileIcon";
