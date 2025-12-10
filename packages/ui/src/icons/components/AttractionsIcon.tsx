import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AttractionsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"attractions"} ref={ref}/>
});

AttractionsIcon.displayName = "AttractionsIcon";
