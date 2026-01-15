import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SwitchRightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"switch_right"} ref={ref}/>
});

SwitchRightIcon.displayName = "SwitchRightIcon";
