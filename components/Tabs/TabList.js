import React from 'react'
import { SortableContainer } from 'react-sortable-hoc'
import { SortableTab } from './Tab'

const tablistStyle = {
  display: 'block',
  padding: 0,
  margin: 0,
  lineHeight: 0,
  color: '#4078c0',
  background: 'black',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
}

export const TabList = ({items, onTabClick, onTabClose}) => (
  <ul style={tablistStyle}>
    {
      items.map(
        (item, index) =>
          <SortableTab
            key={`item-${index}`}
            index={index}
            id={item.id}
            icon={item.icon}
            text={item.text}
            tooltip={item.tooltip}
            active={item.active}
            onTabClick={onTabClick}
            onTabClose={onTabClose}
          />
      )
    }
  </ul>
)
export const SortableTabList = SortableContainer(TabList)
