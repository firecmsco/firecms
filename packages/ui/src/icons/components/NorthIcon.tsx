import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NorthIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"north"} ref={ref}/>
});

NorthIcon.displayName = "NorthIcon";
