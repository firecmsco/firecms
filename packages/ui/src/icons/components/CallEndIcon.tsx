import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CallEndIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"call_end"} ref={ref}/>
});

CallEndIcon.displayName = "CallEndIcon";
