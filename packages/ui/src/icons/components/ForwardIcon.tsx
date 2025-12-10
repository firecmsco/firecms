import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ForwardIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"forward"} ref={ref}/>
});

ForwardIcon.displayName = "ForwardIcon";
