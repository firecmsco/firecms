import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CallMissedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"call_missed"} ref={ref}/>
});

CallMissedIcon.displayName = "CallMissedIcon";
