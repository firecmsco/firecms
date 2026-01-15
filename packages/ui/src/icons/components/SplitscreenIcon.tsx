import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SplitscreenIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"splitscreen"} ref={ref}/>
});

SplitscreenIcon.displayName = "SplitscreenIcon";
