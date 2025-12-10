import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ViewTimelineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"view_timeline"} ref={ref}/>
});

ViewTimelineIcon.displayName = "ViewTimelineIcon";
