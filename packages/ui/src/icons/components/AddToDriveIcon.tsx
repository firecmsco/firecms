import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AddToDriveIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"add_to_drive"} ref={ref}/>
});

AddToDriveIcon.displayName = "AddToDriveIcon";
