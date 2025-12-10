import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SwitchLeftIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"switch_left"} ref={ref}/>
});

SwitchLeftIcon.displayName = "SwitchLeftIcon";
