import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const JoinFullIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"join_full"} ref={ref}/>
});

JoinFullIcon.displayName = "JoinFullIcon";
