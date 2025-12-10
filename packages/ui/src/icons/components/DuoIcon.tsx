import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DuoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"duo"} ref={ref}/>
});

DuoIcon.displayName = "DuoIcon";
