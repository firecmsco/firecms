import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AnnouncementIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"announcement"} ref={ref}/>
});

AnnouncementIcon.displayName = "AnnouncementIcon";
