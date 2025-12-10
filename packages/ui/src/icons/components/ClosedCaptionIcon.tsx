import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ClosedCaptionIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"closed_caption"} ref={ref}/>
});

ClosedCaptionIcon.displayName = "ClosedCaptionIcon";
