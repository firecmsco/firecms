import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TrainIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"train"} ref={ref}/>
});

TrainIcon.displayName = "TrainIcon";
