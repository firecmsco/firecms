import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const UnfoldMoreDoubleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"unfold_more_double"} ref={ref}/>
});

UnfoldMoreDoubleIcon.displayName = "UnfoldMoreDoubleIcon";
