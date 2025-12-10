import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RemoveRedEyeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"remove_red_eye"} ref={ref}/>
});

RemoveRedEyeIcon.displayName = "RemoveRedEyeIcon";
