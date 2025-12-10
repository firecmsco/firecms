import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AutoDeleteIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"auto_delete"} ref={ref}/>
});

AutoDeleteIcon.displayName = "AutoDeleteIcon";
