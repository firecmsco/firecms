import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VapeFreeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"vape_free"} ref={ref}/>
});

VapeFreeIcon.displayName = "VapeFreeIcon";
