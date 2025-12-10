import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DirectionsTrainIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"directions_train"} ref={ref}/>
});

DirectionsTrainIcon.displayName = "DirectionsTrainIcon";
