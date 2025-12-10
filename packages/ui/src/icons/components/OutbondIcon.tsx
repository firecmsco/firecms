import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const OutbondIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"outbond"} ref={ref}/>
});

OutbondIcon.displayName = "OutbondIcon";
