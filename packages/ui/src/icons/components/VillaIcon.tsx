import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VillaIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"villa"} ref={ref}/>
});

VillaIcon.displayName = "VillaIcon";
