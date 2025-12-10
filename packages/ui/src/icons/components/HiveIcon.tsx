import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HiveIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hive"} ref={ref}/>
});

HiveIcon.displayName = "HiveIcon";
