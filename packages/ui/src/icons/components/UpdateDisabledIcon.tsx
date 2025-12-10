import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const UpdateDisabledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"update_disabled"} ref={ref}/>
});

UpdateDisabledIcon.displayName = "UpdateDisabledIcon";
