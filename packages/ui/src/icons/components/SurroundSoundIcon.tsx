import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SurroundSoundIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"surround_sound"} ref={ref}/>
});

SurroundSoundIcon.displayName = "SurroundSoundIcon";
