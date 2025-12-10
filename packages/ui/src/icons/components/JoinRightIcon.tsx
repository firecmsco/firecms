import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const JoinRightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"join_right"} ref={ref}/>
});

JoinRightIcon.displayName = "JoinRightIcon";
