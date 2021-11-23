import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import CloseIcon from '@mui/icons-material/Close'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import PanoramaIcon from '@mui/icons-material/PanoramaOutlined'
import SettingsIcon from '@mui/icons-material/Settings'
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
} from '@mui/material'
import IconButton from '@mui/material/IconButton'
import { setNodes } from '@udecode/plate-common'
import { getRootProps } from '@udecode/plate-styled-components'
import { identity, pickBy } from 'lodash'
import { Resizable } from 're-resizable'
import { Node, Transforms } from 'slate'
import { ReactEditor, useSelected, useFocused } from 'slate-react'

import { useStorageSource } from '../../../hooks'

import { getImageElementStyles } from './ImageElement.styles'
import { ImageElementProps } from './ImageElement.types'
import { ImageHandle } from './ImageHandle'
import { styled } from '@mui/system'

const getColor = (props: {
    isDragActive: boolean
    isDragAccept: boolean
    isDragReject: boolean
}) => {
    if (props.isDragAccept) {
        return '#00e676'
    }
    if (props.isDragReject) {
        return '#ff1744'
    }
    if (props.isDragActive) {
        return '#2196f3'
    }
    return '#eeeeee'
}

export const ImageElement: FC<ImageElementProps> = (props: ImageElementProps) => {
    const {
        attributes,
        children,
        element,
        nodeProps,
        resizableProps = {
            minWidth: 92,
        },
        // align = 'center',
        draggable,
        editor,
    } = props

    const rootProps = getRootProps(props)

    const {
        url,
        width: nodeWidth = '100%',
        caption: nodeCaption = [{ children: [{ text: '' }] }],
        altText,
        align,
        imgId,
    } = element

    const focused = useFocused()
    const selected = useSelected()
    const [width, setWidth] = useState(nodeWidth)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        setWidth(nodeWidth)
    }, [nodeWidth])

    const styles = getImageElementStyles({ ...props, align, focused, selected })

    const setNodeWidth = useCallback(
        (w: number, h: number) => {
            const path = ReactEditor.findPath(editor, element)

            if (w === nodeWidth) {
                // Focus the node if not resized
                Transforms.select(editor, path)
            } else {
                setNodes(editor, { width: w, height: h }, { at: path })
            }
        },
        [editor, element, nodeWidth],
    )

    const onDialogSave = (data: {
        url: string
        align?: string
        altText?: string
        imgId?: string
    }) => {
        const { url, align, altText, imgId } = data
        const path = ReactEditor.findPath(editor, element)
        const props = pickBy({ align, url, altText, imgId }, identity)
        setNodes(editor, props, { at: path })
        setOpen(false)
    }

    const captionString = useMemo(() => {
        return Node.string(nodeCaption[0]) || ''
    }, [nodeCaption])

    const deleteSelf = () => {
        const path = ReactEditor.findPath(editor, element)
        Transforms.removeNodes(editor, { at: path })
    }

    // @ts-ignore
    return (
        <div {...attributes} className={styles.root.className} {...rootProps} {...nodeProps}>
            <div contentEditable={false}>
                <ImageSettingsDialog
                    onClose={() => setOpen(false)}
                    open={open}
                    imgId={imgId}
                    imgSrc={url}
                    caption={altText}
                    align={align}
                    onSave={onDialogSave}
                    deleteSelf={deleteSelf}
                />
                <figure className={`group ${styles.figure?.className}`}>
                    <Resizable
                        // @ts-ignore
                        css={styles.resizable?.css}
                        className={styles.resizable?.className}
                        size={{ width, height: '100%' }}
                        maxWidth="100%"
                        lockAspectRatio
                        resizeRatio={align === 'center' ? 2 : 1}
                        enable={{
                            left: true,
                            right: true,
                        }}
                        handleComponent={{
                            left: (
                                <ImageHandle
                                    css={[styles.handleLeft?.css]}
                                    className={styles.handleLeft?.className}
                                />
                            ),
                            right: (
                                <ImageHandle
                                    css={styles.handleRight?.css}
                                    className={styles.handleRight?.className}
                                />
                            ),
                        }}
                        handleStyles={{
                            left: { left: 0 },
                            right: { right: 0 },
                        }}
                        onResize={(e, direction, ref) => {
                            setWidth(ref.offsetWidth)
                        }}
                        onResizeStop={(e, direction, ref) =>
                            setNodeWidth(ref.offsetWidth, ref.offsetHeight)
                        }
                        {...resizableProps}
                    >
                        {selected && (
                            <div
                                style={{
                                    pointerEvents: 'none',
                                    position: 'absolute',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'start',
                                    justifyContent: 'end',
                                    background: '#66666666',
                                }}
                                className={styles.img?.className}
                            >
                                <IconButton
                                    aria-label="delete"
                                    onClick={() => setOpen(true)}
                                    color={'primary'}
                                    style={{
                                        pointerEvents: 'auto',
                                        background: '#fafafa88',
                                    }}
                                >
                                    <SettingsIcon
                                        style={{
                                            fontSize: '2.5rem',
                                            color: 'black',
                                        }}
                                    />
                                </IconButton>
                            </div>
                        )}
                        <img
                            data-testid="ImageElementImage"
                            className={styles.img?.className}
                            src={url}
                            alt={captionString}
                            draggable={draggable}
                            {...nodeProps}
                        />
                    </Resizable>
                </figure>
            </div>
            {children}
        </div>
    )
}

interface ImageSettingsDialogProps {
    open: boolean
    onClose: () => void
    imgId?: string
    imgSrc?: string
    align?: string
    caption?: string
    onSave: (data: { imgId?: string; url: string; align?: string; altText?: string }) => void
    deleteSelf?: () => void
}

export const ImageSettingsDialog: React.FC<ImageSettingsDialogProps> = ({
    open,
    onClose,
    imgId,
    imgSrc,
    align,
    caption,
    onSave,
    deleteSelf,
}) => {
    const storage = useStorageSource()
    const [imgIdValue, setImgId] = useState<string | undefined>(imgId)
    const [imgSrcValue, setImgSrc] = useState(imgSrc)
    const [imgFileName, setImgFileName] = useState<string>('')
    const [alignValue, setAlign] = useState(align ?? 'left')
    const [captionValue, setCaption] = useState(caption ?? '')
    const [error, setError] = useState<undefined | string>(undefined)
    const [loading, setLoading] = useState(false)

    const upload = (file: File, fileName: string) => {
        setError(undefined)
        setLoading(true)
        setCaption(fileName.replace(/\.[^/.]+$/, ''))
        setImgFileName(fileName)

        storage
            .uploadFile({ file, fileName, path: `images` })
            .then(async ({ path }) => {
                setImgId(path)
                const uploadPathOrDownloadUrl = await storage.getDownloadURL(path)
                setImgSrc(uploadPathOrDownloadUrl)
                console.debug('Upload successful', path, uploadPathOrDownloadUrl)
                setLoading(false)
            })
            .catch(e => {
                console.error('Upload error', e)
                setError(e.message)
                setLoading(false)
            })
    }

    const onDelete = () => {
        console.log('imageId', imgId)
        if (imgIdValue) {
            // storage.removeFile({ filePath: imgIdValue }).then(() => {
            //   deleteSelf()
            // })
            // deleteSelf()
        }
    }

    const onDrop = useCallback(
        (acceptedFiles: Array<File>) => {
            // Do something with the files
            console.log(acceptedFiles)
            if (acceptedFiles.length === 1) {
                const file = acceptedFiles[0]
                upload(file, file.name)
            }
        },
        [upload],
    )
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: 'image/jpeg, image/png',
    })

    useEffect(() => {
        setImgId(imgId)
        setImgSrc(imgSrc)
        setImgFileName(imgId?.replace('images/', '') ?? '')
        setAlign(align ?? 'left')
        setCaption(caption ?? '')
        setError(undefined)
        setLoading(false)
    }, [open])

    return (
        <Dialog open={open} onClose={onClose} maxWidth={'md'} fullWidth scroll={'paper'}>
            <div className="flex px-8 mt-4 ">
                <h4> {imgFileName ? imgFileName : `Upload new Image`}</h4>
                <div className={'flex-grow'} />
                {imgSrcValue != null && (
                    <>
                        <div {...getRootProps()}>
                            <input {...getInputProps()} />

                            <Button
                                variant="outlined"
                                sx={{ margin: '0 6px' }}
                                endIcon={<FileUploadIcon />}
                            >
                                Change
                            </Button>
                        </div>

                        <Button
                            variant="outlined"
                            sx={{ margin: '0 6px' }}
                            endIcon={<CloseIcon />}
                            onClick={onDelete}
                        >
                            Remove
                        </Button>
                    </>
                )}
            </div>
            <DialogContent>
                <Paper className="flex justify-center">
                    {loading ? (
                        <CircularProgress className={'self-center my-12 mx-auto'} />
                    ) : imgSrcValue != null ? (
                        <img src={imgSrcValue} />
                    ) : (
                        <div
                            {...getRootProps()}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '20px',
                                borderWidth: '2px',
                                borderRadius: '2px',
                                borderStyle: 'dashed',
                                backgroundColor: '#fafafa',
                                color: '#bdbdbd',
                                outline: 'none',
                                transition: 'border 0.24s ease-in-out',
                            }}
                        >
                            <input {...getInputProps()} />
                            <PanoramaIcon
                                fontSize="large"
                                style={{
                                    fontSize: '4rem',
                                }}
                            />
                            <span className={isDragActive ? 'font-bold text-black' : ''}>
                                Drop Image here or click to Upload
                            </span>
                        </div>
                    )}
                </Paper>

                {error && <p>{error}</p>}
                <div className="flex mt-4 justify-between">
                    <FormControl>
                        <InputLabel id="align-label">Align</InputLabel>
                        <Select
                            labelId="align-label"
                            id="align"
                            value={alignValue}
                            label="Align"
                            onChange={e => {
                                setAlign(e.target.value)
                            }}
                            defaultValue={'left'}
                        >
                            <MenuItem value={'left'}>Left</MenuItem>
                            <MenuItem value={'center'}>Center</MenuItem>
                            <MenuItem value={'right'}>Right</MenuItem>
                            <MenuItem value={'justify'}>Justify</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        multiline
                        value={captionValue}
                        onChange={e => {
                            setCaption(e.target.value)
                        }}
                        id="caption"
                        label="Caption"
                        variant="outlined"
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <Button variant={'contained'} color={'secondary'} onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    variant={'contained'}
                    color={'primary'}
                    disabled={imgSrcValue == null}
                    onClick={() =>
                        onSave({
                            imgId: imgIdValue,
                            url: imgSrcValue ?? '',
                            altText: captionValue,
                            align: alignValue,
                        })
                    }
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    )
}
