import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LabelOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"label_off"} ref={ref}/>
});

LabelOffIcon.displayName = "LabelOffIcon";
