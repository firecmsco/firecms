import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AirplayIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"airplay"} ref={ref}/>
});

AirplayIcon.displayName = "AirplayIcon";
