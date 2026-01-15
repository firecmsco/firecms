import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ModeNightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mode_night"} ref={ref}/>
});

ModeNightIcon.displayName = "ModeNightIcon";
