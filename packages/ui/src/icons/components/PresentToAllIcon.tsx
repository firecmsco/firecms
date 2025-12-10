import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PresentToAllIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"present_to_all"} ref={ref}/>
});

PresentToAllIcon.displayName = "PresentToAllIcon";
