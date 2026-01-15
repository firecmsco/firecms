import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DoNotStepIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"do_not_step"} ref={ref}/>
});

DoNotStepIcon.displayName = "DoNotStepIcon";
