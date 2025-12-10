import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CollectionsBookmarkIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"collections_bookmark"} ref={ref}/>
});

CollectionsBookmarkIcon.displayName = "CollectionsBookmarkIcon";
