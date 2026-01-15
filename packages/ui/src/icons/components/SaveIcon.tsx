import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SaveIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"save"} ref={ref}/>
});

SaveIcon.displayName = "SaveIcon";
