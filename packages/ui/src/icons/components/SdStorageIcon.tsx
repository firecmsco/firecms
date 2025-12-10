import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SdStorageIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sd_storage"} ref={ref}/>
});

SdStorageIcon.displayName = "SdStorageIcon";
