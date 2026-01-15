import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PauseIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pause"} ref={ref}/>
});

PauseIcon.displayName = "PauseIcon";
