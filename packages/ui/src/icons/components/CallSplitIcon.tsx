import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CallSplitIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"call_split"} ref={ref}/>
});

CallSplitIcon.displayName = "CallSplitIcon";
