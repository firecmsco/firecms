import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NoBackpackIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"no_backpack"} ref={ref}/>
});

NoBackpackIcon.displayName = "NoBackpackIcon";
