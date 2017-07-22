import React from 'react'
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu/dist/react-contextmenu.js";

const hotReload = () => {
  System.reload('./nde/app.js')
}

export default function ({cuid, filepath, onSave, onReset, onRestore, children, ...props}) {
  return (
    <ContextMenu id={cuid} {...props}>
      <MenuItem onClick={hotReload}>
        Hot Reload Page
      </MenuItem>
      <MenuItem divider />
      <MenuItem onClick={onSave}>
        Save File
      </MenuItem>
      <MenuItem onClick={onReset}>
        Reload Saved File
      </MenuItem>
      <MenuItem onClick={onRestore}>
        Restore Original File
      </MenuItem>
      <MenuItem divider />
      {children}
    </ContextMenu>
  )
}