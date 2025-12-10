import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TramIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"tram"} ref={ref}/>
});

TramIcon.displayName = "TramIcon";
