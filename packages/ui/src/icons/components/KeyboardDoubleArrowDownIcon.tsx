import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const KeyboardDoubleArrowDownIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"keyboard_double_arrow_down"} ref={ref}/>
});

KeyboardDoubleArrowDownIcon.displayName = "KeyboardDoubleArrowDownIcon";
