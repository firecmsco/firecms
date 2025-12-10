import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TransferWithinAStationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"transfer_within_a_station"} ref={ref}/>
});

TransferWithinAStationIcon.displayName = "TransferWithinAStationIcon";
