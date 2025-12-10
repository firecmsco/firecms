import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FiberSmartRecordIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fiber_smart_record"} ref={ref}/>
});

FiberSmartRecordIcon.displayName = "FiberSmartRecordIcon";
