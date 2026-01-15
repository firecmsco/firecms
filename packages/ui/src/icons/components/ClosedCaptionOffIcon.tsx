import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ClosedCaptionOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"closed_caption_off"} ref={ref}/>
});

ClosedCaptionOffIcon.displayName = "ClosedCaptionOffIcon";
