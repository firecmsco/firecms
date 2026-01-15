import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const KeyboardDoubleArrowRightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"keyboard_double_arrow_right"} ref={ref}/>
});

KeyboardDoubleArrowRightIcon.displayName = "KeyboardDoubleArrowRightIcon";
