import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BackupTableIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"backup_table"} ref={ref}/>
});

BackupTableIcon.displayName = "BackupTableIcon";
