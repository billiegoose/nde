import React from 'react'

export const PrettyError = ({error, onDismiss}) => (
  <div style={{ color: 'red', border: '1px dashed red', padding: '1em' }}>
    <details style={{ whiteSpace: 'pre' }}>
      <summary>
        <button onClick={() => onDismiss && onDismiss()}>
          Dismiss
        </button>
        {error && error.error && error.error.toString()}
      </summary>
      {error && error.errorInfo && error.errorInfo.componentStack}
    </details>
  </div>
)
