import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MmsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mms"} ref={ref}/>
});

MmsIcon.displayName = "MmsIcon";
