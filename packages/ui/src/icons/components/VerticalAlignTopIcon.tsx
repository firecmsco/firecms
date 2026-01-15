import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VerticalAlignTopIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"vertical_align_top"} ref={ref}/>
});

VerticalAlignTopIcon.displayName = "VerticalAlignTopIcon";
