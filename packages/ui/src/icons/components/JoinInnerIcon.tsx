import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const JoinInnerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"join_inner"} ref={ref}/>
});

JoinInnerIcon.displayName = "JoinInnerIcon";
