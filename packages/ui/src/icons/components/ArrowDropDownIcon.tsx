import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ArrowDropDownIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"arrow_drop_down"} ref={ref}/>
});

ArrowDropDownIcon.displayName = "ArrowDropDownIcon";
