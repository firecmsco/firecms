import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const JoinLeftIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"join_left"} ref={ref}/>
});

JoinLeftIcon.displayName = "JoinLeftIcon";
