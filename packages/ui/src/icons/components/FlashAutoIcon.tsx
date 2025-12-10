import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FlashAutoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"flash_auto"} ref={ref}/>
});

FlashAutoIcon.displayName = "FlashAutoIcon";
