import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SaveAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"save_alt"} ref={ref}/>
});

SaveAltIcon.displayName = "SaveAltIcon";
