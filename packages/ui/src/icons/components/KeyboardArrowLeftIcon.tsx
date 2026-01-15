import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const KeyboardArrowLeftIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"keyboard_arrow_left"} ref={ref}/>
});

KeyboardArrowLeftIcon.displayName = "KeyboardArrowLeftIcon";
