import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const UnfoldLessDoubleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"unfold_less_double"} ref={ref}/>
});

UnfoldLessDoubleIcon.displayName = "UnfoldLessDoubleIcon";
