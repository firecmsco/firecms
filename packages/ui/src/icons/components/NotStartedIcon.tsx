import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NotStartedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"not_started"} ref={ref}/>
});

NotStartedIcon.displayName = "NotStartedIcon";
