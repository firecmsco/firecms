import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ModeOfTravelIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mode_of_travel"} ref={ref}/>
});

ModeOfTravelIcon.displayName = "ModeOfTravelIcon";
