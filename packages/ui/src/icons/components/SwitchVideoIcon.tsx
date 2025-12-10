import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SwitchVideoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"switch_video"} ref={ref}/>
});

SwitchVideoIcon.displayName = "SwitchVideoIcon";
