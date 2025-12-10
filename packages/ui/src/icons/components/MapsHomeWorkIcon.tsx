import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MapsHomeWorkIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"maps_home_work"} ref={ref}/>
});

MapsHomeWorkIcon.displayName = "MapsHomeWorkIcon";
