import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PolicyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"policy"} ref={ref}/>
});

PolicyIcon.displayName = "PolicyIcon";
