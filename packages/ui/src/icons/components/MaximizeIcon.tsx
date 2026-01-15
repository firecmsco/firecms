import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MaximizeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"maximize"} ref={ref}/>
});

MaximizeIcon.displayName = "MaximizeIcon";
