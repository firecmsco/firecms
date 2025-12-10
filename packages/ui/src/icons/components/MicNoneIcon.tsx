import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MicNoneIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mic_none"} ref={ref}/>
});

MicNoneIcon.displayName = "MicNoneIcon";
