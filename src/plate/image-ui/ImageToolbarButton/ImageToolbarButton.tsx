import React, { useState } from 'react'
import { insertNodes } from '@udecode/plate-common'
import { getPlatePluginType, TElement, usePlateEditorRef } from '@udecode/plate-core'
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-toolbar'

import { ELEMENT_IMAGE } from '../../image'
import { ImageSettingsDialog } from '../ImageElement'

export interface ImageToolbarButtonProps extends ToolbarButtonProps {
  /**
   * Default onMouseDown is getting the image url by calling this promise before inserting the image.
   */
  getImageUrl?: () => Promise<string>
}

export const ImageToolbarButton = ({ getImageUrl, ...props }: ImageToolbarButtonProps) => {
  const editor = usePlateEditorRef()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const save: (data: { url: string; align?: string; altText?: string; imgId?: string }) => void = ({
    url,
    align,
    altText,
    imgId,
  }) => {
    const image = {
      type: getPlatePluginType(editor, ELEMENT_IMAGE),
      url,
      children: [{ text: '' }],
      align,
      altText,
      imgId,
    }
    insertNodes<TElement>(editor, image)
    close()
  }

  return (
    <>
      <ToolbarButton
        onMouseDown={event => {
          if (!editor) return
          event.preventDefault()
          setOpen(true)
        }}
        {...props}
      />
      <ImageSettingsDialog onClose={close} open={open} deleteSelf={close} onSave={save} />
    </>
  )
}
