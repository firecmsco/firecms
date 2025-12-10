import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LooksOneIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"looks_one"} ref={ref}/>
});

LooksOneIcon.displayName = "LooksOneIcon";
