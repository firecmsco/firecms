import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CheckBoxOutlineBlankIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"check_box_outline_blank"} ref={ref}/>
});

CheckBoxOutlineBlankIcon.displayName = "CheckBoxOutlineBlankIcon";
