import React from 'react'
import { SortableElement } from 'react-sortable-hoc'

const baseTabStyle = {
  display: 'inline-block',
  padding: '5px',
  whiteSpace: 'nowrap',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
}

const activeTabStyle = {
  ...baseTabStyle,
  color: 'white',
  background: '#1e1e1e',
  border: '1px solid',
  borderBottom: 'none',
  borderTopLeftRadius: '10px'
}

const inactiveTabStyle = {
  ...baseTabStyle,
  color: '#6d6d6d',
  background: '#000000',
  border: '1px solid',
  borderBottom: 'none',
  borderTopLeftRadius: '10px'
}

export const Tab = ({id, text, tooltip, icon, active, onTabClick, onTabClose}) => {
  if (active) {
    return (
      <li style={activeTabStyle} title={tooltip} onClick={() => onTabClick(id)}>
        <i className="fa fa-window-close" onClick={(e) => { e.stopPropagation(); onTabClose(id) }}></i>
        {' ' + text}
      </li>
    )
  } else {
    return (
      <li style={inactiveTabStyle} title={tooltip} onClick={() => onTabClick(id)}>
        {icon}
        {text}
      </li>
    )
  }
}

export const SortableTab = SortableElement(Tab)
