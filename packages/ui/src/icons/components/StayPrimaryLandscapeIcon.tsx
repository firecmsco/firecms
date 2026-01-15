import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StayPrimaryLandscapeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"stay_primary_landscape"} ref={ref}/>
});

StayPrimaryLandscapeIcon.displayName = "StayPrimaryLandscapeIcon";
