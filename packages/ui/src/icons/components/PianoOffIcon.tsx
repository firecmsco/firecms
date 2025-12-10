import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PianoOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"piano_off"} ref={ref}/>
});

PianoOffIcon.displayName = "PianoOffIcon";
