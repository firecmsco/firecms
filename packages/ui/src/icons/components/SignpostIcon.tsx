import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SignpostIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"signpost"} ref={ref}/>
});

SignpostIcon.displayName = "SignpostIcon";
