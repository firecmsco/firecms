import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RestoreIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"restore"} ref={ref}/>
});

RestoreIcon.displayName = "RestoreIcon";
