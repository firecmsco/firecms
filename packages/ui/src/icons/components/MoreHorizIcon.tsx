import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MoreHorizIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"more_horiz"} ref={ref}/>
});

MoreHorizIcon.displayName = "MoreHorizIcon";
