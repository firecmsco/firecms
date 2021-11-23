import { createStyles } from '@udecode/plate-styled-components'

import { ImageElementStyleProps } from './ImageElement.types'

export const getImageElementStyles = (props: ImageElementStyleProps) => {
    const { focused, selected, align } = props

    const handle = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        poistion: 'absolute',
        userSelect: 'auto',
        width: '1.5rem',
        height: '100%',
        top: '0px',
        zIndex: '10',
        '&::after': {
            background: focused && selected ? 'grey' : 'none',
            display: 'flex',
            content: ' ',
            width: '3px',
            height: '64px',
            borderRadius: '6px',
            // 'group-hover:opacity-100'
        },
    }
    //
    // :hover,
    // :focus,
    // :active {
    //     ::after {
    //         ${tw`bg-blue-500`};
    //     }
    // }

    return createStyles(
        { prefixClassNames: 'ImageElement', ...props },
        {
            root: {
                padding: '0.625rem',
            },
            resizable: {
                margin: align === 'center' ? '0 auto' : align === 'right' ? '0 0 0 auto' : '0',
            },
            figure: { position: 'relative', margin: '0' },
            img: {
                display: 'block',
                maxWidth: '100%',
                padding: 0,
                cursor: 'pointer',
                width: '100%',
                borderRadius: '3px',
                objectFit: 'cover',
                boxShadow: focused && selected ? '0 0 0 1px rgb(59,130,249)' : '',
            },
            handleLeft: {
                ...handle,
                left: '-0.75rem',
                marginLeft: '-0.75rem',
                paddingLeft: '0.75rem',
            },
            handleRight: {
                ...handle,
                right: '-0.75rem',
                marginRight: '-0.75rem',
                paddingRight: '0.75rem',
                alignItems: 'flex-end',
            },
        },
    )
}
