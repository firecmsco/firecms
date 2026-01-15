import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const KebabDiningIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"kebab_dining"} ref={ref}/>
});

KebabDiningIcon.displayName = "KebabDiningIcon";
