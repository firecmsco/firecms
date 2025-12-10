import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const InputIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"input"} ref={ref}/>
});

InputIcon.displayName = "InputIcon";
