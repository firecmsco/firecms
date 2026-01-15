import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BackHandIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"back_hand"} ref={ref}/>
});

BackHandIcon.displayName = "BackHandIcon";
