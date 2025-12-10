import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalConvenienceStoreIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_convenience_store"} ref={ref}/>
});

LocalConvenienceStoreIcon.displayName = "LocalConvenienceStoreIcon";
