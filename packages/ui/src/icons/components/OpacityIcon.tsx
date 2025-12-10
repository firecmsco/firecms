import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const OpacityIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"opacity"} ref={ref}/>
});

OpacityIcon.displayName = "OpacityIcon";
