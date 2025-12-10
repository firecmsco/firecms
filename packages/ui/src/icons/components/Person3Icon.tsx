import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Person3Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"person_3"} ref={ref}/>
});

Person3Icon.displayName = "Person3Icon";
