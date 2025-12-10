import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const UpdateIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"update"} ref={ref}/>
});

UpdateIcon.displayName = "UpdateIcon";
