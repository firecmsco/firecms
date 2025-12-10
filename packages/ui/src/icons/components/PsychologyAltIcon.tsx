import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PsychologyAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"psychology_alt"} ref={ref}/>
});

PsychologyAltIcon.displayName = "PsychologyAltIcon";
