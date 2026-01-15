import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ModeEditIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mode_edit"} ref={ref}/>
});

ModeEditIcon.displayName = "ModeEditIcon";
