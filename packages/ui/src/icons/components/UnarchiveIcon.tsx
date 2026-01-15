import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const UnarchiveIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"unarchive"} ref={ref}/>
});

UnarchiveIcon.displayName = "UnarchiveIcon";
