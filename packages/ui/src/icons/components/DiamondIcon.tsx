import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DiamondIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"diamond"} ref={ref}/>
});

DiamondIcon.displayName = "DiamondIcon";
