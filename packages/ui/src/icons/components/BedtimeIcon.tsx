import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BedtimeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bedtime"} ref={ref}/>
});

BedtimeIcon.displayName = "BedtimeIcon";
