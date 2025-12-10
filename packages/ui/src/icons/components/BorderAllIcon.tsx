import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BorderAllIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"border_all"} ref={ref}/>
});

BorderAllIcon.displayName = "BorderAllIcon";
