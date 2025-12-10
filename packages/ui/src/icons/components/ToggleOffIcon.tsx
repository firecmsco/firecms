import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ToggleOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"toggle_off"} ref={ref}/>
});

ToggleOffIcon.displayName = "ToggleOffIcon";
