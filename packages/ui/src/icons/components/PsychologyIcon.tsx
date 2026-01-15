import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PsychologyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"psychology"} ref={ref}/>
});

PsychologyIcon.displayName = "PsychologyIcon";
