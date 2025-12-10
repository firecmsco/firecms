import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SubdirectoryArrowLeftIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"subdirectory_arrow_left"} ref={ref}/>
});

SubdirectoryArrowLeftIcon.displayName = "SubdirectoryArrowLeftIcon";
