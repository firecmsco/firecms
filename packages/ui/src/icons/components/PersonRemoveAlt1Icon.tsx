import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PersonRemoveAlt1Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"person_remove_alt_1"} ref={ref}/>
});

PersonRemoveAlt1Icon.displayName = "PersonRemoveAlt1Icon";
