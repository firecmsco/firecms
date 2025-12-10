import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RuleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"rule"} ref={ref}/>
});

RuleIcon.displayName = "RuleIcon";
