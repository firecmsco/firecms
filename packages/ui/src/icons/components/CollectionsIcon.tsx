import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CollectionsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"collections"} ref={ref}/>
});

CollectionsIcon.displayName = "CollectionsIcon";
