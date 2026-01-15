import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NoCrashIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"no_crash"} ref={ref}/>
});

NoCrashIcon.displayName = "NoCrashIcon";
