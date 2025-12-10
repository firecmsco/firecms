import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const KeyboardDoubleArrowLeftIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"keyboard_double_arrow_left"} ref={ref}/>
});

KeyboardDoubleArrowLeftIcon.displayName = "KeyboardDoubleArrowLeftIcon";
