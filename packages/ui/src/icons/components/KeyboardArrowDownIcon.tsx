import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const KeyboardArrowDownIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"keyboard_arrow_down"} ref={ref}/>
});

KeyboardArrowDownIcon.displayName = "KeyboardArrowDownIcon";
