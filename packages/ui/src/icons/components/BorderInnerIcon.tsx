import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BorderInnerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"border_inner"} ref={ref}/>
});

BorderInnerIcon.displayName = "BorderInnerIcon";
