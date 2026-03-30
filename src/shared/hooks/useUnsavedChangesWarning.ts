import { useBeforeUnload, useBlocker } from 'react-router-dom'

/**
 * Warns the user before they leave/reload the page when there are unsaved changes.
 * Intercepts both browser tab close/reload (beforeunload) and React Router navigation.
 */
export function useUnsavedChangesWarning(isDirty: boolean) {
  useBeforeUnload(
    (e) => {
      if (isDirty) {
        e.preventDefault()
      }
    },
    { capture: true }
  )

  useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty &&
      currentLocation.pathname !== nextLocation.pathname &&
      !window.confirm('You have unsaved changes. Leave anyway?')
  )
}
