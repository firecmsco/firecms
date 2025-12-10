import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TrackChangesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"track_changes"} ref={ref}/>
});

TrackChangesIcon.displayName = "TrackChangesIcon";
