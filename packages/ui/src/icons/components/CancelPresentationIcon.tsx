import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CancelPresentationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"cancel_presentation"} ref={ref}/>
});

CancelPresentationIcon.displayName = "CancelPresentationIcon";
