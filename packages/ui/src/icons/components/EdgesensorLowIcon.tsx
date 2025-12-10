import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EdgesensorLowIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"edgesensor_low"} ref={ref}/>
});

EdgesensorLowIcon.displayName = "EdgesensorLowIcon";
