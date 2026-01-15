import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FilterFramesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"filter_frames"} ref={ref}/>
});

FilterFramesIcon.displayName = "FilterFramesIcon";
