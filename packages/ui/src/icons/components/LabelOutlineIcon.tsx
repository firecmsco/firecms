import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LabelOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"label_outline"} ref={ref}/>
});

LabelOutlineIcon.displayName = "LabelOutlineIcon";
