import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VolunteerActivismIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"volunteer_activism"} ref={ref}/>
});

VolunteerActivismIcon.displayName = "VolunteerActivismIcon";
