import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const KeyboardDoubleArrowUpIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"keyboard_double_arrow_up"} ref={ref}/>
});

KeyboardDoubleArrowUpIcon.displayName = "KeyboardDoubleArrowUpIcon";
