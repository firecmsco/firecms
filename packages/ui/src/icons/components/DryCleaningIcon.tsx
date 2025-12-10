import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DryCleaningIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"dry_cleaning"} ref={ref}/>
});

DryCleaningIcon.displayName = "DryCleaningIcon";
