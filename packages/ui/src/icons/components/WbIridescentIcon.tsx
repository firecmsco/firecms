import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WbIridescentIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wb_iridescent"} ref={ref}/>
});

WbIridescentIcon.displayName = "WbIridescentIcon";
