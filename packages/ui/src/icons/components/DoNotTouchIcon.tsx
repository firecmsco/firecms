import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DoNotTouchIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"do_not_touch"} ref={ref}/>
});

DoNotTouchIcon.displayName = "DoNotTouchIcon";
