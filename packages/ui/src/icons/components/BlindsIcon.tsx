import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BlindsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"blinds"} ref={ref}/>
});

BlindsIcon.displayName = "BlindsIcon";
