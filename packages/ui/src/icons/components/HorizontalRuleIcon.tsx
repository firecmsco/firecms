import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HorizontalRuleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"horizontal_rule"} ref={ref}/>
});

HorizontalRuleIcon.displayName = "HorizontalRuleIcon";
