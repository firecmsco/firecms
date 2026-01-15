import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CompareArrowsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"compare_arrows"} ref={ref}/>
});

CompareArrowsIcon.displayName = "CompareArrowsIcon";
