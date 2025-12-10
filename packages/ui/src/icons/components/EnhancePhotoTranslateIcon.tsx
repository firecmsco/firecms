import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EnhancePhotoTranslateIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"enhance_photo_translate"} ref={ref}/>
});

EnhancePhotoTranslateIcon.displayName = "EnhancePhotoTranslateIcon";
