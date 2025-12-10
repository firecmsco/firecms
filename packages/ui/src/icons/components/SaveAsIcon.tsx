import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SaveAsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"save_as"} ref={ref}/>
});

SaveAsIcon.displayName = "SaveAsIcon";
