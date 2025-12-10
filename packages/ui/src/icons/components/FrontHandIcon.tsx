import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FrontHandIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"front_hand"} ref={ref}/>
});

FrontHandIcon.displayName = "FrontHandIcon";
