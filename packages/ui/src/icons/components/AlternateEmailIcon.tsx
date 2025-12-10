import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AlternateEmailIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"alternate_email"} ref={ref}/>
});

AlternateEmailIcon.displayName = "AlternateEmailIcon";
