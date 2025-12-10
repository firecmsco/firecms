import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RemoveCircleOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"remove_circle_outline"} ref={ref}/>
});

RemoveCircleOutlineIcon.displayName = "RemoveCircleOutlineIcon";
