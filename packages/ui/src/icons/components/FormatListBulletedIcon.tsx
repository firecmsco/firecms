import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FormatListBulletedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"format_list_bulleted"} ref={ref}/>
});

FormatListBulletedIcon.displayName = "FormatListBulletedIcon";
