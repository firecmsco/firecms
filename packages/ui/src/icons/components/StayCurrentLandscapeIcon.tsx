import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StayCurrentLandscapeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"stay_current_landscape"} ref={ref}/>
});

StayCurrentLandscapeIcon.displayName = "StayCurrentLandscapeIcon";
