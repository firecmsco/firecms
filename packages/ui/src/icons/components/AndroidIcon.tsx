import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AndroidIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"android"} ref={ref}/>
});

AndroidIcon.displayName = "AndroidIcon";
