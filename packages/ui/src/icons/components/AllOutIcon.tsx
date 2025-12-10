import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AllOutIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"all_out"} ref={ref}/>
});

AllOutIcon.displayName = "AllOutIcon";
