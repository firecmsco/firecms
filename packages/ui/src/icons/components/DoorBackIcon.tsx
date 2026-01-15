import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DoorBackIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"door_back"} ref={ref}/>
});

DoorBackIcon.displayName = "DoorBackIcon";
