import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CheckBoxIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"check_box"} ref={ref}/>
});

CheckBoxIcon.displayName = "CheckBoxIcon";
