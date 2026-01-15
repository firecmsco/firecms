import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LoopIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"loop"} ref={ref}/>
});

LoopIcon.displayName = "LoopIcon";
