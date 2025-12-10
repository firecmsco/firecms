import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SmartButtonIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"smart_button"} ref={ref}/>
});

SmartButtonIcon.displayName = "SmartButtonIcon";
