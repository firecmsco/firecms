import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CutIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"cut"} ref={ref}/>
});

CutIcon.displayName = "CutIcon";
