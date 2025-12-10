import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VerticalAlignBottomIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"vertical_align_bottom"} ref={ref}/>
});

VerticalAlignBottomIcon.displayName = "VerticalAlignBottomIcon";
