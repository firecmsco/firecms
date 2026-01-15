import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ClosedCaptionDisabledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"closed_caption_disabled"} ref={ref}/>
});

ClosedCaptionDisabledIcon.displayName = "ClosedCaptionDisabledIcon";
