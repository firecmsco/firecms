import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const OutlinedFlagIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"outlined_flag"} ref={ref}/>
});

OutlinedFlagIcon.displayName = "OutlinedFlagIcon";
