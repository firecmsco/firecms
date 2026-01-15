import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FiberManualRecordIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fiber_manual_record"} ref={ref}/>
});

FiberManualRecordIcon.displayName = "FiberManualRecordIcon";
