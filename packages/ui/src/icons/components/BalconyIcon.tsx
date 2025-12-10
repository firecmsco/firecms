import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BalconyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"balcony"} ref={ref}/>
});

BalconyIcon.displayName = "BalconyIcon";
