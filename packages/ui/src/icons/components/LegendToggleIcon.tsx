import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LegendToggleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"legend_toggle"} ref={ref}/>
});

LegendToggleIcon.displayName = "LegendToggleIcon";
