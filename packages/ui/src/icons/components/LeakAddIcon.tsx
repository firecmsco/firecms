import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LeakAddIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"leak_add"} ref={ref}/>
});

LeakAddIcon.displayName = "LeakAddIcon";
