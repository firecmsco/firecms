import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DriveEtaIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"drive_eta"} ref={ref}/>
});

DriveEtaIcon.displayName = "DriveEtaIcon";
