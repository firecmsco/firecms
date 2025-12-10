import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PianoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"piano"} ref={ref}/>
});

PianoIcon.displayName = "PianoIcon";
