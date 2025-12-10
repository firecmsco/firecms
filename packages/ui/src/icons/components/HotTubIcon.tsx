import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HotTubIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hot_tub"} ref={ref}/>
});

HotTubIcon.displayName = "HotTubIcon";
