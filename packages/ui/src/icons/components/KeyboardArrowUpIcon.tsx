import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const KeyboardArrowUpIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"keyboard_arrow_up"} ref={ref}/>
});

KeyboardArrowUpIcon.displayName = "KeyboardArrowUpIcon";
