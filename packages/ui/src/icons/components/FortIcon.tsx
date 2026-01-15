import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FortIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fort"} ref={ref}/>
});

FortIcon.displayName = "FortIcon";
