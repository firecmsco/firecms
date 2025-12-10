import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LabelIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"label"} ref={ref}/>
});

LabelIcon.displayName = "LabelIcon";
