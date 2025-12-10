import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NoEncryptionIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"no_encryption"} ref={ref}/>
});

NoEncryptionIcon.displayName = "NoEncryptionIcon";
