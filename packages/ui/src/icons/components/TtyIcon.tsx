import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TtyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"tty"} ref={ref}/>
});

TtyIcon.displayName = "TtyIcon";
