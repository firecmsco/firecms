import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DataArrayIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"data_array"} ref={ref}/>
});

DataArrayIcon.displayName = "DataArrayIcon";
