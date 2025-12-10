import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RepartitionIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"repartition"} ref={ref}/>
});

RepartitionIcon.displayName = "RepartitionIcon";
