import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LeakRemoveIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"leak_remove"} ref={ref}/>
});

LeakRemoveIcon.displayName = "LeakRemoveIcon";
