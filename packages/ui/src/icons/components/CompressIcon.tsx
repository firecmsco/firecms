import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CompressIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"compress"} ref={ref}/>
});

CompressIcon.displayName = "CompressIcon";
