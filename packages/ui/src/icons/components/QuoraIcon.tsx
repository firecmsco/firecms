import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const QuoraIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"quora"} ref={ref}/>
});

QuoraIcon.displayName = "QuoraIcon";
