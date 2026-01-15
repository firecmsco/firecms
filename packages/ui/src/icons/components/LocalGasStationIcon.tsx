import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalGasStationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_gas_station"} ref={ref}/>
});

LocalGasStationIcon.displayName = "LocalGasStationIcon";
