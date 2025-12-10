import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LivingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"living"} ref={ref}/>
});

LivingIcon.displayName = "LivingIcon";
