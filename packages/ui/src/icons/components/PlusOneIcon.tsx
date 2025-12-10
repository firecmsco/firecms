import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PlusOneIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"plus_one"} ref={ref}/>
});

PlusOneIcon.displayName = "PlusOneIcon";
