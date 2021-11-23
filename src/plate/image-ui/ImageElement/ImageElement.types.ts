import { ImageNodeData } from '@udecode/plate-image'
import { StyledElementProps } from '@udecode/plate-styled-components'
import { ResizableProps } from 're-resizable'

export interface ImageElementStyleProps extends ImageElementProps {
    selected?: boolean
    focused?: boolean
}

export interface ImageElementStyles {
    resizable: any
    figure: any
    img: any
    figcaption: any
    caption: any
    handle: any
    handleLeft: any
    handleRight: any
}

export interface ImageElementProps extends StyledElementProps<ImageNodeData, ImageElementStyles> {
    resizableProps?: ResizableProps

    /**
     * Image alignment.
     */
    align?: 'left' | 'center' | 'right'

    /**
     * Whether the image is draggable.
     */
    draggable?: boolean
}
