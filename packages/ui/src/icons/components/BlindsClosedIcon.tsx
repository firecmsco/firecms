import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BlindsClosedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"blinds_closed"} ref={ref}/>
});

BlindsClosedIcon.displayName = "BlindsClosedIcon";
