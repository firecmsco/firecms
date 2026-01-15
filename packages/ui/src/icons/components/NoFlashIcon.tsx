import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NoFlashIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"no_flash"} ref={ref}/>
});

NoFlashIcon.displayName = "NoFlashIcon";
