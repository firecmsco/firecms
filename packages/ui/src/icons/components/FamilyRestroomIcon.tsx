import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FamilyRestroomIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"family_restroom"} ref={ref}/>
});

FamilyRestroomIcon.displayName = "FamilyRestroomIcon";
