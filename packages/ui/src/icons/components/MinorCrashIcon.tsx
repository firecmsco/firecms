import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MinorCrashIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"minor_crash"} ref={ref}/>
});

MinorCrashIcon.displayName = "MinorCrashIcon";
