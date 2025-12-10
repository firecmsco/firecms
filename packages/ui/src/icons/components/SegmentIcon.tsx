import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SegmentIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"segment"} ref={ref}/>
});

SegmentIcon.displayName = "SegmentIcon";
