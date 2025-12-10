import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const KeyboardArrowRightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"keyboard_arrow_right"} ref={ref}/>
});

KeyboardArrowRightIcon.displayName = "KeyboardArrowRightIcon";
