import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CompareIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"compare"} ref={ref}/>
});

CompareIcon.displayName = "CompareIcon";
