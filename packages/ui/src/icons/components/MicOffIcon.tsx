import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MicOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mic_off"} ref={ref}/>
});

MicOffIcon.displayName = "MicOffIcon";
