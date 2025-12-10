import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BackupIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"backup"} ref={ref}/>
});

BackupIcon.displayName = "BackupIcon";
