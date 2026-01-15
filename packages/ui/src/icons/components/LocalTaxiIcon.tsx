import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalTaxiIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_taxi"} ref={ref}/>
});

LocalTaxiIcon.displayName = "LocalTaxiIcon";
