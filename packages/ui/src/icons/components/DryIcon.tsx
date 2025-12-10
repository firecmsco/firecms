import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DryIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"dry"} ref={ref}/>
});

DryIcon.displayName = "DryIcon";
