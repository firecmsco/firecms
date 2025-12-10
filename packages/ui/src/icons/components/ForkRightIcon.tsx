import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ForkRightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fork_right"} ref={ref}/>
});

ForkRightIcon.displayName = "ForkRightIcon";
