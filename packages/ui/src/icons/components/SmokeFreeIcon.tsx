import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SmokeFreeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"smoke_free"} ref={ref}/>
});

SmokeFreeIcon.displayName = "SmokeFreeIcon";
