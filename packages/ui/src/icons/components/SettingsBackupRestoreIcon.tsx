import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SettingsBackupRestoreIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"settings_backup_restore"} ref={ref}/>
});

SettingsBackupRestoreIcon.displayName = "SettingsBackupRestoreIcon";
