import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NextPlanIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"next_plan"} ref={ref}/>
});

NextPlanIcon.displayName = "NextPlanIcon";
