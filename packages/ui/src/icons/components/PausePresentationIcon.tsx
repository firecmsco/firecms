import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PausePresentationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pause_presentation"} ref={ref}/>
});

PausePresentationIcon.displayName = "PausePresentationIcon";
