import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AttachEmailIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"attach_email"} ref={ref}/>
});

AttachEmailIcon.displayName = "AttachEmailIcon";
