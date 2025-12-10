import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CategoryIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"category"} ref={ref}/>
});

CategoryIcon.displayName = "CategoryIcon";
