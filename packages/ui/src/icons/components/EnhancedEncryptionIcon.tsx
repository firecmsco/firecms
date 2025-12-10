import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EnhancedEncryptionIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"enhanced_encryption"} ref={ref}/>
});

EnhancedEncryptionIcon.displayName = "EnhancedEncryptionIcon";
