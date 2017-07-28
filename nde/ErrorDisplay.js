import React from 'react'

export default function ErrorDisplay ({headline, error, errorInfo}) {
  headline = headline || 'Error'
  error = error || ''
  errorInfo = errorInfo || ''
  let stack = error.stack ? (
    <details>
      <summary>
        Stack Trace
      </summary>
      {error.stack}
    </details>
  ) : ''
  let componentStack = errorInfo.componentStack ? (
    <details>
      <summary>
        Component Stack
      </summary>
      {errorInfo.componentStack}
    </details>
  ) : ''
  let errLine1 = String(error).split('\n')[0]
  let errLine2 = String(error).split('\n').slice(1).join('\n')
  return (
    <div style={{ color: 'red', border: '1px dashed red', padding: '1em', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
      <h2>{headline}</h2>
      <details>
        <summary>
          {errLine1}
        </summary>
        {errLine2}
      </details>
      <br/>
      {componentStack}
      <br/>
      {stack}
    </div>
  )
}