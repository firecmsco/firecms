import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HealingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"healing"} ref={ref}/>
});

HealingIcon.displayName = "HealingIcon";
