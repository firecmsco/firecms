import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const OutboxIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"outbox"} ref={ref}/>
});

OutboxIcon.displayName = "OutboxIcon";
