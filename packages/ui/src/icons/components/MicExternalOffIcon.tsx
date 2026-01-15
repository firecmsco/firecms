import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MicExternalOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mic_external_off"} ref={ref}/>
});

MicExternalOffIcon.displayName = "MicExternalOffIcon";
