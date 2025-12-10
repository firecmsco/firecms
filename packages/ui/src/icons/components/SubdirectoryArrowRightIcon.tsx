import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SubdirectoryArrowRightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"subdirectory_arrow_right"} ref={ref}/>
});

SubdirectoryArrowRightIcon.displayName = "SubdirectoryArrowRightIcon";
