import React, { Fragment, useRef, useState } from 'react'
import {
  Backdrop,
  Box,
  FormControl,
  FormHelperText,
  Modal,
  Theme,
  Dialog,
  DialogTitle,
  Button,
} from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

import { FieldDescription } from '../../form/components'
import { useClearRestoreValue } from '../../hooks'
import { FieldProps } from '../../models'
import {LabelWithIcon} from '../components/LabelWithIcon'

import {
  createHistoryPlugin,
  createReactPlugin,
  createParagraphPlugin,
  createBlockquotePlugin,
  createHeadingPlugin,
  createBoldPlugin,
  createItalicPlugin,
  createUnderlinePlugin,
  createStrikethroughPlugin,
  Plate,
  ELEMENT_PARAGRAPH,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  usePlateEditorRef,
  getPlatePluginType,
  BlockToolbarButton,
  ELEMENT_BLOCKQUOTE,
  HeadingToolbar,
  createPlateComponents,
  ELEMENT_CODE_BLOCK,
  withProps,
  CodeBlockElement,
  createPlateOptions,
  BalloonToolbar,
  MarkToolbarButton,
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
  AlignToolbarButton,
  createAlignPlugin,
  ToolbarBase,
} from '@udecode/plate'
import {
  FormatAlignCenter,
  FormatAlignJustify,
  FormatAlignLeft,
  FormatAlignRight,
  FormatBold,
  FormatItalic,
  FormatQuote,
  FormatUnderlined,
  Looks3,
  Looks4,
  Looks5,
  Looks6,
  LooksOne,
  LooksTwo,
  Image as ImageIcon,
} from '@mui/icons-material'
import { UsePopperPositionOptions } from '@udecode/plate-popper'
import { TippyProps } from '@tippyjs/react'
import { createImagePlugin, ELEMENT_IMAGE } from '../../plate/image'
import { ImageToolbarButton } from '../../plate/image-ui/ImageToolbarButton'
import { ImageElement } from '../../plate/image-ui/ImageElement'

// Stored in PLUGINS.basicNodes
const basicNodesPlugins = [
  // editor
  createReactPlugin(), // withReact
  createHistoryPlugin(), // withHistory

  // elements
  createParagraphPlugin(), // paragraph element
  createBlockquotePlugin(), // blockquote element
  createHeadingPlugin(), // heading elements

  // marks
  createBoldPlugin(), // bold mark
  createItalicPlugin(), // italic mark
  createUnderlinePlugin(), // underline mark
  createStrikethroughPlugin(), // strikethrough mark

  createAlignPlugin({
    validTypes: [
      ELEMENT_PARAGRAPH,
      ELEMENT_H1,
      ELEMENT_H2,
      ELEMENT_H3,
      ELEMENT_H4,
      ELEMENT_H5,
      ELEMENT_H6,
      ELEMENT_IMAGE,
    ],
  }),
  createImagePlugin(),
]

type EditorJSFieldProps = FieldProps<string>

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    fieldDesc: {
      display: 'flex',
      alignItems: 'center',
    },
    spaceHolder: {
      flexGrow: 1,
    },
    toolbar: {
      display: 'flex',
      margin: '0 0 4px 0',
      padding: 0,
      border: 'inherit',
      '& .slate-ToolbarButton-active, .slate-ToolbarButton:hover': {
        fontWeight: 'bold',
        color: 'blue',
      },
    },
    dialog: {
      display: 'flex',
      alignItems: 'center',
    },
    root: {
      width: '95%',
      margin: '0 10px',
      '& .w-md-editor-toolbar': {
        backgroundColor:
          theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.09)' : 'rgba(255, 255, 255, 0.13)',
      },
    },
  }),
)

export const createElement = (
  text = '',
  {
    type = ELEMENT_PARAGRAPH,
    mark,
  }: {
    type?: string
    mark?: string
  } = {},
) => {
  const leaf = { text }
  if (mark) {
    leaf[mark] = true
  }

  return {
    type,
    children: [leaf],
  }
}

const basicNodesInitialValue = [
  createElement('🧱 Elements', { type: ELEMENT_H1 }),
  createElement('🔥 Basic Elements', { type: ELEMENT_H2 }),
  createElement('These are the most common elements, known as blocks:'),
  createElement('Heading 1', { type: ELEMENT_H1 }),
  createElement('Heading 2', { type: ELEMENT_H2 }),
  createElement('Heading 3', { type: ELEMENT_H3 }),
  createElement('Heading 4', { type: ELEMENT_H4 }),
  createElement('Heading 5', { type: ELEMENT_H5 }),
  createElement('Heading 6', { type: ELEMENT_H6 }),
]

const BasicElementToolbarButtons = () => {
  const editor = usePlateEditorRef()

  return (
    <>
      <MarkToolbarButton type={getPlatePluginType(editor, MARK_BOLD)} icon={<FormatBold />} />
      <MarkToolbarButton type={getPlatePluginType(editor, MARK_ITALIC)} icon={<FormatItalic />} />
      <MarkToolbarButton
        type={getPlatePluginType(editor, MARK_UNDERLINE)}
        icon={<FormatUnderlined />}
      />
      <BlockToolbarButton type={getPlatePluginType(editor, ELEMENT_H1)} icon={<LooksOne />} />
      <BlockToolbarButton type={getPlatePluginType(editor, ELEMENT_H2)} icon={<LooksTwo />} />
      <BlockToolbarButton type={getPlatePluginType(editor, ELEMENT_H3)} icon={<Looks3 />} />
      <BlockToolbarButton type={getPlatePluginType(editor, ELEMENT_H4)} icon={<Looks4 />} />
      <BlockToolbarButton type={getPlatePluginType(editor, ELEMENT_H5)} icon={<Looks5 />} />
      <BlockToolbarButton type={getPlatePluginType(editor, ELEMENT_H6)} icon={<Looks6 />} />
      <BlockToolbarButton
        type={getPlatePluginType(editor, ELEMENT_BLOCKQUOTE)}
        icon={<FormatQuote />}
      />
      <AlignToolbarButton value="left" icon={<FormatAlignLeft />} />
      <AlignToolbarButton value="center" icon={<FormatAlignCenter />} />
      <AlignToolbarButton value="right" icon={<FormatAlignRight />} />
      <AlignToolbarButton value="justify" icon={<FormatAlignJustify />} />
      <ImageToolbarButton icon={<ImageIcon />} />
    </>
  )
}

const components = createPlateComponents({
  [ELEMENT_CODE_BLOCK]: withProps(CodeBlockElement, {
    styles: {
      root: [
        // css`
        //   background-color: #111827;
        //   code {
        //     color: white;
        //   }
        // `,
      ],
    },
  }),
  [ELEMENT_IMAGE]: ImageElement,
})

const BallonToolbarMarks = () => {
  const editor = usePlateEditorRef()

  const arrow = false
  const theme = 'dark'
  const popperOptions: Partial<UsePopperPositionOptions> = {
    placement: 'top',
  }
  const tooltip: TippyProps = {
    arrow: true,
    delay: 0,
    duration: [200, 0],
    hideOnClick: false,
    offset: [0, 17],
    placement: 'top',
  }

  return (
    <BalloonToolbar
      popperOptions={popperOptions}
      theme={theme}
      arrow={arrow}
      styles={{ root: { zIndex: 99999 } }}
    >
      <MarkToolbarButton type={getPlatePluginType(editor, MARK_BOLD)} icon={<FormatBold />} />
      <MarkToolbarButton type={getPlatePluginType(editor, MARK_ITALIC)} icon={<FormatItalic />} />
      <MarkToolbarButton
        type={getPlatePluginType(editor, MARK_UNDERLINE)}
        icon={<FormatUnderlined />}
      />
    </BalloonToolbar>
  )
}

/**
 * Render a markdown field that allows edition and seeing the preview.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export default function PlateJSField({
  name,
  value,
  setValue,
  error,
  showError,
  disabled,
  autoFocus,
  touched,
  property,
  tableMode,
  includeDescription,
  context,
  dependsOnOtherProperties,
}: EditorJSFieldProps) {
  const classes = useStyles()
  const [open, setOpen] = useState(false)

  const cancelButtonRef = useRef(null)
  useClearRestoreValue({
    property,
    value,
    setValue,
  })

  const updateValue = (newValue: string | undefined) => {
    if (!newValue) {
      setValue(null)
    } else {
      setValue(newValue)
    }
  }

  console.log(value != null ? JSON.parse(value) : undefined)

  const editor = (
    <div className={classes.root}>
      <BallonToolbarMarks />
      <ToolbarBase className={classes.toolbar}>
        <BasicElementToolbarButtons />
      </ToolbarBase>
      <Plate
        id={`dialog-editor-${property}`}
        editableProps={{
          spellCheck: false,
          placeholder: 'Type…',
          style: {
            padding: '15px',
            border: 'solid 1px lightgrey',
          },
        }}
        options={createPlateOptions()}
        components={components}
        // editableProps={CONFIG.editableProps}
        value={value != null ? JSON.parse(value) : undefined}
        plugins={basicNodesPlugins}
        onChange={changedValue => {
          // console.log(changedValue)
          setValue(JSON.stringify(changedValue))
        }}
      />
    </div>
  )

  return (
    <FormControl
      required={property.validation?.required}
      error={showError}
      fullWidth
      variant="filled"
    >
      {!tableMode && (
        <FormHelperText
          className={classes.fieldDesc}
          filled
          required={property.validation?.required}
        >
          <LabelWithIcon property={property} />
          <div className={classes.spaceHolder} />
          <Button onClick={() => setOpen(true)}> FullScreen</Button>
        </FormHelperText>
      )}

      {open ? (
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth={'lg'}
          fullWidth
          scroll={'paper'}
          classes={{ container: classes.dialog, paper: classes.dialog }}
        >
          <DialogTitle>{name}</DialogTitle>
          {editor}
        </Dialog>
      ) : (
        editor
      )}

      <Box display={'flex'}>
        <Box flexGrow={1}>
          {showError && typeof error === 'string' && <FormHelperText>{error}</FormHelperText>}
          {includeDescription && <FieldDescription property={property} />}
        </Box>
      </Box>
    </FormControl>
  )
}
