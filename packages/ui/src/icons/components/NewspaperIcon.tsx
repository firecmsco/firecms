import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NewspaperIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"newspaper"} ref={ref}/>
});

NewspaperIcon.displayName = "NewspaperIcon";
