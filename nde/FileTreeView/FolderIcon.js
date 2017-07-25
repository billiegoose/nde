/*
 * The MIT License (MIT)
 * Copyright (c) 2017 Websemantics --- freaking brilliant original SVG from https://github.com/websemantics/markdown-browser-plus
 * Copyright (c) 2017 William Hilton --- turned into a React component
 */
export default function ({open}) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" viewBox="0 0 14 16" className="folder icon">
      <path d="M13 4H9V3c0-.66-.31-1-1-1H1c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zM8 4H1V3h7z"></path>
      <path d="M1 3v4.094h12V4.97H8V3H1z" style={{fill: (open ? '#fff' : 'none')}}></path>
    </svg>
  );
}