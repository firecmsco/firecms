import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AlignVerticalBottomIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"align_vertical_bottom"} ref={ref}/>
});

AlignVerticalBottomIcon.displayName = "AlignVerticalBottomIcon";
