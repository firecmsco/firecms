import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MouseIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mouse"} ref={ref}/>
});

MouseIcon.displayName = "MouseIcon";
